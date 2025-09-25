from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from django.core.management import call_command
from .models import LoginAttempt


class AuthEmailOrUsernameTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='tester', email='tester@example.com', password='StrongPass123'
		)

	def test_login_with_username(self):
		url = reverse('get_token')
		resp = self.client.post(url, {'username': 'tester', 'password': 'StrongPass123'}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.assertIn('access', resp.data)

	def test_login_with_email(self):
		url = reverse('get_token')
		resp = self.client.post(url, {'username': 'tester@example.com', 'password': 'StrongPass123'}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.assertIn('access', resp.data)

	def test_register_with_email(self):
		url = reverse('register')
		resp = self.client.post(url, {
			'username': 'newuser',
			'email': 'newuser@example.com',
			'password': 'AnotherPass123'
		}, format='json')
		self.assertEqual(resp.status_code, 201)
		self.assertTrue(User.objects.filter(username='newuser', email='newuser@example.com').exists())

	def test_login_user_not_found(self):
		url = reverse('get_token')
		resp = self.client.post(url, {'username': 'missing@example.com', 'password': 'Whatever123'}, format='json')
		self.assertEqual(resp.status_code, 401)
		self.assertEqual(resp.data.get('code'), 'user_not_found')

	def test_login_bad_password(self):
		url = reverse('get_token')
		resp = self.client.post(url, {'username': 'tester', 'password': 'WrongPass999'}, format='json')
		self.assertEqual(resp.status_code, 401)
		self.assertEqual(resp.data.get('code'), 'bad_password')

	def test_register_duplicate_email(self):
		url = reverse('register')
		resp = self.client.post(url, {
			'username': 'another',
			'email': 'tester@example.com',  # existing email
			'password': 'SomePass123'
		}, format='json')
		self.assertEqual(resp.status_code, 400)
		self.assertIn('email', resp.data)

	def test_register_weak_password(self):
		url = reverse('register')
		resp = self.client.post(url, {
			'username': 'weakling',
			'email': 'weak@example.com',
			'password': 'short'
		}, format='json')
		self.assertEqual(resp.status_code, 400)
		self.assertIn('password', resp.data)


@override_settings(AUTH_RATE_LIMIT={'WINDOW_MINUTES': 5, 'MAX_FAILURES': 3, 'BLOCK_MINUTES': 1, 'RETENTION_DAYS': 30})
class AuthRateLimitTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='ratelimit', email='ratelimit@example.com', password='RatePass123')
		self.token_url = reverse('get_token')

	def _wrong_login(self):
		return self.client.post(self.token_url, { 'username': 'ratelimit', 'password': 'WrongPass999' }, format='json')

	def test_bad_password_remaining_attempts(self):
		# First wrong attempt => remaining should be 2 (MAX 3 -1)
		r1 = self._wrong_login()
		self.assertEqual(r1.status_code, 401)
		self.assertEqual(r1.data.get('code'), 'bad_password')
		self.assertEqual(int(r1.data.get('remaining_attempts')), 2)

		# Second wrong attempt => remaining 1
		r2 = self._wrong_login()
		self.assertEqual(int(r2.data.get('remaining_attempts')), 1)

	def test_lockout_after_max_failures(self):
		# Perform MAX_FAILURES wrong attempts
		for _ in range(3):
			self._wrong_login()
		# Next attempt should be blocked
		blocked = self._wrong_login()
		self.assertEqual(blocked.status_code, 401)
		self.assertEqual(blocked.data.get('code'), 'too_many_attempts')
		self.assertIn('retry_after_minutes', blocked.data)

	def test_lockout_expires_allows_login(self):
		# Trigger block
		for _ in range(3):
			self._wrong_login()
		# Manually age the last failure beyond block window (BLOCK_MINUTES=1)
		past_time = timezone.now() - timedelta(minutes=2)
		LoginAttempt.objects.filter(identifier__iexact='ratelimit').update(created_at=past_time)
		# Correct password should now succeed (block expired)
		ok = self.client.post(self.token_url, { 'username': 'ratelimit', 'password': 'RatePass123' }, format='json')
		self.assertEqual(ok.status_code, 200)
		self.assertIn('access', ok.data)


class LoginAttemptAnalyticsTests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_user(username='admin', password='AdminPass123', email='admin@example.com', is_staff=True, is_superuser=True)
		self.user = User.objects.create_user(username='normal', password='NormalPass123', email='normal@example.com')
		self.analytics_url = reverse('login_attempt_analytics')
		self.token_url = reverse('get_token')

	def test_analytics_requires_admin(self):
		# Unauthenticated -> 401 (not authorized)
		unauth = self.client.get(self.analytics_url)
		self.assertIn(unauth.status_code, (401, 403))

		# Auth as normal user -> 403
		token_resp = self.client.post(self.token_url, { 'username': 'normal', 'password': 'NormalPass123' }, format='json')
		access = token_resp.data['access']
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
		forbidden = self.client.get(self.analytics_url)
		self.assertEqual(forbidden.status_code, 403)

	def test_analytics_returns_basic_structure(self):
		# Generate some failures
		for _ in range(2):
			self.client.post(self.token_url, { 'username': 'normal', 'password': 'BadPass999' }, format='json')
		# Force auth as admin
		self.client.force_authenticate(user=self.admin)
		resp = self.client.get(self.analytics_url)
		self.assertEqual(resp.status_code, 200)
		for key in ['total_attempts', 'failures', 'successes', 'failure_rate', 'top_identifiers', 'top_ips']:
			self.assertIn(key, resp.data)
		# After a successful login (which may trigger cleanup), analytics should include last_cleanup_at key
		# Force one successful login as normal user to potentially stamp cleanup
		self.client.force_authenticate(user=None)
		self.client.post(self.token_url, { 'username': 'normal', 'password': 'NormalPass123' }, format='json')
		self.client.force_authenticate(user=self.admin)
		resp2 = self.client.get(self.analytics_url)
		self.assertIn('last_cleanup_at', resp2.data)


@override_settings(AUTH_RATE_LIMIT={'WINDOW_MINUTES': 5, 'MAX_FAILURES': 3, 'BLOCK_MINUTES': 1, 'RETENTION_DAYS': 1})
class PurgeLoginAttemptsCommandTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='purger', password='PurgePass123', email='purger@example.com')

	def test_purge_command_removes_old_attempts(self):
		# Create an old attempt beyond retention
		old_time = timezone.now() - timedelta(days=2)
		la_old = LoginAttempt.objects.create(identifier='purger', user=self.user, successful=False)
		LoginAttempt.objects.filter(pk=la_old.pk).update(created_at=old_time)
		# And a recent one
		LoginAttempt.objects.create(identifier='purger', user=self.user, successful=False)
		self.assertEqual(LoginAttempt.objects.count(), 2)
		call_command('purge_login_attempts')
		self.assertEqual(LoginAttempt.objects.count(), 1)

from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User


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

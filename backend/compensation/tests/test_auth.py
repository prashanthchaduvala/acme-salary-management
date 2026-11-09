from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test.hr',
            email='test.hr@acme.org',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )

    def test_user_registration_success(self):
        url = reverse('auth-register')
        payload = {
            'username': 'new.recruiter',
            'email': 'new.recruiter@acme.org',
            'password': 'SecurePassword123!',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'role': 'Talent Lead',
            'department': 'People Ops'
        }
        res = self.client.post(url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['username'], 'new.recruiter')
        self.assertEqual(res.data['user']['role'], 'Talent Lead')

    def test_user_registration_duplicate_username(self):
        url = reverse('auth-register')
        payload = {
            'username': 'test.hr',  # already exists
            'email': 'unique@acme.org',
            'password': 'SecurePassword123!',
        }
        res = self.client.post(url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        url = reverse('auth-login')
        payload = {
            'username': 'test.hr',
            'password': 'TestPassword123!'
        }
        res = self.client.post(url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['email'], 'test.hr@acme.org')

    def test_user_login_with_email(self):
        url = reverse('auth-login')
        payload = {
            'username': 'test.hr@acme.org',  # passing email as login identifier
            'password': 'TestPassword123!'
        }
        res = self.client.post(url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)

    def test_user_login_invalid_credentials(self):
        url = reverse('auth-login')
        payload = {
            'username': 'test.hr',
            'password': 'WrongPassword!'
        }
        res = self.client.post(url, data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_authenticated(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        url = reverse('auth-me')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['isAuthenticated'])
        self.assertEqual(res.data['user']['username'], 'test.hr')

    def test_logout(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        url = reverse('auth-logout')
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.user).exists())

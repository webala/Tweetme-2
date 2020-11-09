from django.test import TestCase
from .models import Tweet
from django.contrib.auth import get_user_model
# Create your tests here.

User = get_user_model()

class TweetTestCase(TestCase):
from django.test import TestCase
from .models import Tweet
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
# Create your tests here.

User = get_user_model()

class TweetTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cfe', password='somepassword')
        self.userb = User.objects.create_user(username='cfe-2', password='somepassword2')
        Tweet.objects.create(content='my first tweet', user=self.user)
        Tweet.objects.create(content='my first tweet', user=self.user)
        Tweet.objects.create(content='my first tweet', user=self.userb)
        self.current_count = Tweet.objects.all().count()
    
    def test_tweet_created(self):
        tweet_obj = Tweet.objects.create(content='my tweet', user=self.user)
        self.assertEqual(tweet_obj.id, 4)
        self.assertEqual(tweet_obj.user, self.user)

    def get_client(self):
        client = APIClient()
        client.login(username=self.user.username, password='somepassword')
        return client

    def test_tweet_list(self):
        client = self.get_client()
        response = client.get('/api/tweet/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()),3)
        
    def test_action_like(self):
        client = self.get_client()
        response = client.post('/api/tweet/action', 
            {'id': 1,'action': 'like'})
        self.assertEqual(response.status_code, 200)
        like_count = response.json().get('likes')
        self.assertEqual(like_count, 1)
        #print(response.json())

    def test_action_unlike(self):
        client = self.get_client()
        response = client.post('/api/tweet/action',
            {'id':2, 'action': 'like'})
        self.assertEqual(response.status_code, 200)
        response = client.post('/api/tweet/action',
            {'id':2, 'action': 'unlike'})
        self.assertEqual(response.status_code, 200)
        like_count = response.json().get('likes')
        self.assertEqual(like_count, 0)

    def test_action_retweet(self):
        client = self.get_client()
        current_count = self.current_count
        response = client.post('/api/tweet/action',
            {'id':3, 'action': 'retweet'})
        self.assertEqual(response.status_code, 201)
        new_tweet_id = response.json().get('id')
        self.assertNotEqual(2, new_tweet_id)
        self.assertEqual(current_count + 1, new_tweet_id)

    def test_tweet_create_api_view(self):
        request_data = {'content': 'Test tweet create'}
        client = self.get_client()
        response = client.post('/api/tweet/create', request_data)
        self.assertEqual(response.status_code, 201)
        current_count = self.current_count
        new_tweet_id = response.json().get('id')
        self.assertEqual(current_count + 1, new_tweet_id)

    def test_tweet_detail_api_view(self):
        client = self.get_client()
        response = client.get('/api/tweet/1')
        self.assertEqual(response.status_code, 200)
        _id = response.json().get('id')
        self.assertEqual(_id, 1)
    
    def test_tweet_delete_api_view(self):
        client = self.get_client()
        response = client.delete('/api/tweet/1/delete')
        self.assertEqual(response.status_code, 200)
        response = client.delete('/api/tweet/1/delete')
        self.assertEqual(response.status_code, 404)
        response_for_unauthenticated = client.delete('/api/tweet/3/delete')
        self.assertEqual(response_for_unauthenticated.status_code, 401)
        


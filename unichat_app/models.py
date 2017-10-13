from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

from .validators import *


class CustomUserManager(BaseUserManager):
	def create_user(self, username, email, password = None):
		if not username:
			raise ValueError('Users must have a unique username.')
		# if not email:
		# 	raise ValueError('Users must have a valid e-mail address.')
		user = self.model(
			username = username,
			email = self.normalize_email(email)
		)
		user.set_password(password)
		user.save(self._db)
		return user

	def create_superuser(self, username, email, password):
		user = self.create_user(
			username = username,
			email = email,
			password = password,
		)
		user.is_superuser = True
		user.is_admin = True
		user.is_staff = True
		user.save(using = self._db)
		return user


def user_directory_path(instance, filename):
	return 'user_{0}/{1}'.format(instance, filename)

class User(AbstractUser):
	GENDER = (
		('M', 'Male'),
		('F', 'Female')
	)
	username = models.CharField(max_length = 25, unique = True, validators = [signup_username_validator])
	display_name = models.CharField(max_length = 25, null = True, blank = True)
	email = models.EmailField(max_length = 50, unique = True)
	gender = models.CharField(max_length = 1, choices = GENDER, null = True, blank = True)
	bios = models.CharField(max_length = 255, null = True, blank = True)
	avatar = models.ImageField(upload_to = user_directory_path, height_field = 50, width_field = 50, null = True, blank = True)
	signup_time = models.DateField(auto_now = True)

	objects = CustomUserManager()

	class Meta(AbstractUser.Meta):
		swappable = 'AUTH_USER_MODEL'

	def clean(self):
		if not self.display_name:
			self.display_name = self.username


class Contact(models.Model):
	user = models.ForeignKey(User, related_name = 'contact_myself')
	contact_user = models.ForeignKey(User, related_name = 'contact_user')
	contact_remarkname = models.CharField(max_length = 25, null = True, blank = True)

	def __str__(self):
		return self.user.username + ' +-> ' + self.contact_user.username

	def clean(self):
		if not self.contact_remarkname:
			self.contact_remarkname = self.contact_user.username
		if self.user == self.contact_user:
			raise ValidationError('Adding self is not recommended :D')
		if Contact.objects.filter(user = self.user, contact_user = self.contact_user):
			if Contact.objects.get(user = self.user, contact_user = self.contact_user) != self:
				raise ValidationError('%(me)s has already added %(user)s', params = {'me': self.user.username, 'user': self.contact_user.username})


class ChatList(models.Model):
	user = models.ForeignKey(User, related_name = 'chat_myself')
	chat_user = models.ForeignKey(Contact, related_name = 'chat_user')

	def __str__(self):
		return self.user.username + ' :-> ' + self.chat_user.contact_user.username

	def clean(self):
		if self.user == self.chat_user:
			raise ValidationError('Chatting with self is not recommended :D')
		if ChatList.objects.filter(user = self.user, chat_user = self.chat_user):
			raise ValidationError('%(me)s has already had a chat with %(user)s',
			                      params = {'me': self.user.username, 'user': self.chat_user.contact_user.username})


class Message(models.Model):
	sender = models.ForeignKey(User)
	receiver = models.ForeignKey(ChatList)
	content = models.CharField(max_length = 9999)
	create_datetime = models.DateTimeField(auto_now = True)

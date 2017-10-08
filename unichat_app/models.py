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
	username = models.CharField(max_length = 50, unique = True)
	display_name = models.CharField(max_length = 50, null = True, blank = True)
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
	user = models.ForeignKey(User)
	contact_username = models.CharField(max_length = 25, validators = [contact_username_validator])
	contact_remarkname = models.CharField(max_length = 50, null = True, blank = True)
	add_date = models.DateField(auto_now = True)

	def __str__(self):
		return self.user.username + ' +-> ' + self.contact_username

	def clean(self):
		if not self.contact_remarkname:
			self.contact_remarkname = self.contact_username

class ChatList(models.Model):
	user = models.ForeignKey(User)
	chat_username = models.CharField(max_length = 25)

	def __str__(self):
		return self.user.username + ' :-> ' + self.chat_username

	def clean(self):
		chat_user = Contact.objects.filter(user = self.user, contact_username = self.chat_username)
		if not chat_user:
			raise ValidationError('%(user)s isn\'t your contact', params = {'user': self.chat_username})

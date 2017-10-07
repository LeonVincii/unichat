from django.db import models
from django.contrib.auth.models import AbstractUser

from .validators import *


# Create your models here.
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
	signup_time = models.DateField(auto_now = True)

	class Meta(AbstractUser.Meta):
		swappable = 'AUTH_USER_MODEL'


class Contact(models.Model):
	user = models.ForeignKey(User)
	contact_username = models.CharField(max_length = 25, validators = [contact_username_validator])
	contact_displayname = models.CharField(max_length = 50, null = True, blank = True)
	contact_remarkname = models.CharField(max_length = 50, null = True, blank = True)
	add_date = models.DateField(auto_now = True)

	def __str__(self):
		return self.user.username + ' -> ' + self.contact_username

	def clean(self):
		if not self.contact_displayname:
			self.contact_displayname = self.contact_username
		if not self.contact_remarkname:
			self.contact_remarkname = self.contact_username


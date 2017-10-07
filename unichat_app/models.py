from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
	GENDER = (
		('M', 'Male'),
		('F', 'Female')
	)
	username = models.CharField(max_length = 50, unique = True)
	email = models.EmailField(max_length = 50, unique = True)
	gender = models.CharField(max_length = 1, choices = GENDER, null = True, blank = True)
	bios = models.CharField(max_length = 255, null = True, blank = True)
	signup_time = models.DateField(auto_now = True)

	class Meta(AbstractUser.Meta):
		swappable = 'AUTH_USER_MODEL'

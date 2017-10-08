from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import *


class RegistrationForm(UserCreationForm):
	class Meta:
		model = User
		fields = [
			'username',
			'email',
			'password1',
			'password2',
			'gender',
			'bios'
		]


class ContactForm(forms.ModelForm):
	class Meta:
		model = Contact
		fields = [
			'contact_username'
		]

class ChatListForm(forms.ModelForm):
	class Meta:
		model = ChatList
		fields = [
			'chat_username'
		]
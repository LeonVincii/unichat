from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login, authenticate
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.generic.edit import FormView

from .forms import *


# Create your views here.
class HomeView(LoginRequiredMixin, TemplateView):
	def get(self, request, *args, **kwargs):
		return render(request, 'home/home.html', {
			'username': request.user.username,
			'user_contacts': Contact.objects.filter(user = request.user),
		})


# Override the django provided LoginView to prevent interference from user login and admin login.
class UserLoginView(LoginView):
	next = '/'


# Override the django provided LoginView to prevent interference from user logout and admin logout.
class UserLogoutView(LogoutView):
	next_page = '/login/?next=/'


class UserRegisterView(FormView):
	def get(self, request, *args, **kwargs):
		return render(request, 'registration/register.html', {})

	def post(self, request, *args, **kwargs):
		signup_form = RegistrationForm(request.POST)
		if signup_form.is_valid():
			signup_form.save()
			username = signup_form.cleaned_data.get('username')
			password = signup_form.cleaned_data.get('password')
			user = authenticate(username = username, password = password)
			login(request, user)
			return HttpResponseRedirect('')
		if signup_form.errors:
			errors = signup_form.errors
			return render(request, 'registration/register.html', {'errors': errors})

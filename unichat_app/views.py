from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login, authenticate
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.utils.timezone import now as current_time
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from rest_framework import status

from .forms import *
from .serializers import *


class HomeView(LoginRequiredMixin, TemplateView):
	def get(self, request, *args, **kwargs):
		print('request received: ', request)
		return render(request, 'home/home.html', {
			'username': request.user.username,
			'avatar': request.user.avatar,
			'gender': request.user.gender,
			'chat_list': ChatList.objects.filter(user = request.user).order_by('-last_active_time'),
			'user_contacts': Contact.objects.filter(user = request.user).order_by('contact_remarkname'),
		})


# Overrides the django provided LoginView to prevent interference from user login and admin login.
class UserLoginView(LoginView):
	next = '/'


# Overrides the django provided LoginView to prevent interference from user logout and admin logout.
class UserLogoutView(LogoutView):
	next_page = '/login/?next=/'


class UserRegisterView(FormView):
	def get(self, request, *args, **kwargs):
		return render(request, 'registration/register.html', {})

	def post(self, request, *args, **kwargs):
		signup_form = RegistrationForm(request.POST)
		if signup_form.is_valid():
			user = signup_form.save()
			username = signup_form.cleaned_data.get('username')
			password = signup_form.cleaned_data.get('password')
			authenticate(username = username, password = password)
			login(request, user)
			return HttpResponseRedirect('/')
		if signup_form.errors:
			errors = signup_form.errors
			return render(request, 'registration/register.html', {'errors': errors})


def signup_username_validation(request):
	field = request.POST.get('field')
	data = {}
	if field == 'username':
		username = request.POST.get('username')
		data = {
			'username_has_taken': User.objects.filter(username__iexact = username).exists()
		}
	elif field == 'email':
		email = request.POST.get('email')
		data = {
			'email_has_taken': User.objects.filter(email__exact = email).exists()
		}
	return JsonResponse(data)


def user_obj_json_view(request):
	username = request.POST.get('username')
	user_obj = User.objects.get(username = username)
	user_obj_json = UserDetailSerializer(user_obj).data
	return JsonResponse(user_obj_json)


def add_delete_chat_view(request, **kwargs):
	myself = request.user
	username = kwargs.get('username')
	chat_user = Contact.objects.get(user = myself, contact_user = User.objects.get(username = username))
	if request.method == 'POST':
		if ChatList.objects.filter(user = myself, chat_user = chat_user).exists():
			chat = ChatList.objects.get(user = myself, chat_user = chat_user)
			chat.last_active_time = current_time()
			chat.save()
		else:
			ChatList.objects.create(
				user = myself,
				chat_user = chat_user
			)
		return HttpResponse({}, status = status.HTTP_201_CREATED)
	elif request.method == 'DELETE':
		if ChatList.objects.filter(user = myself, chat_user = chat_user).exists():
			chat = ChatList.objects.get(user = myself, chat_user = chat_user)
			chat.delete()
		return HttpResponse({}, status = status.HTTP_200_OK)
	return HttpResponse({}, status = status.HTTP_404_NOT_FOUND)


def alter_remark_view(request, **kwargs):
	myself = request.user
	username = kwargs.get('username')
	if request.method == 'POST':
		contact_user = Contact.objects.get(user = myself, contact_user = User.objects.get(username = username))
		contact_user.contact_remarkname = request.POST.get('contact_remarkname')
		contact_user.save()
		return HttpResponse({}, status = status.HTTP_200_OK)
	return HttpResponse({}, status = status.HTTP_404_NOT_FOUND)


def chat_view(request, **kwargs):
	myself = request.user
	username = kwargs.get('username')
	chat_user = Contact.objects.get(user = myself, contact_user = User.objects.get(username = username))
	if request.method == 'GET':
		msgs_send = Message.objects.filter(sender = myself, receiver = chat_user).order_by('create_datetime')
		msgs_receive = Message.objects.filter(sender = chat_user.contact_user,
		                                      receiver = Contact.objects.get(user = chat_user.contact_user, contact_user = myself)
		                                      ).order_by('create_datetime')
		msgs = list(msgs_send) + list(msgs_receive)
		msgs_sorted = sorted(msgs, key = lambda x: x.create_datetime)
		for msg in msgs_sorted:
			print(msg.content)
		return render(request, 'home/message_list.html', {
			'myself': request.user,
			'msgs': msgs_sorted,
		})

	elif request.method == 'POST':
		chat = ChatList.objects.get(user = myself, chat_user = chat_user)
		msg = request.POST.get('msg')
		chat.last_active_time = current_time()
		Message.objects.create(
			sender = myself,
			receiver = chat_user,
			content = msg,
			create_datetime = current_time()
		)
		return HttpResponse({}, status = status.HTTP_200_OK)

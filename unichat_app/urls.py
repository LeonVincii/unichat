from django.conf.urls import url
from .views import *

urlpatterns = [
	# The home page.
	url(r'^$', HomeView.as_view()),
	url(r'login/$', UserLoginView.as_view(), name = 'login'),
	url(r'logout/$', UserLogoutView.as_view()),
	url(r'register/$', UserRegisterView.as_view(), name = 'register'),

	url(r'ajax_signup_validation/$', signup_username_validation),
	url(r'ajax_user_detail/$', user_obj_json_view),
	url(r'ajax_add_chat/(?P<username>[\w._-]+)/$', add_chat_view),
	url(r'ajax_delete_chat/(?P<username>[\w._-]+)/$', delete_chat_view),
]

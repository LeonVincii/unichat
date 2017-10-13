from rest_framework import serializers

from .models import User, ChatList

class UserDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		exclude = ('password', 'is_active', 'is_staff', 'is_superuser', 'user_permissions')

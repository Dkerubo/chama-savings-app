from flask_admin.contrib.sqla import ModelView
from .models import User, Member, Group
from . import admin, db

admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Member, db.session))
admin.add_view(ModelView(Group, db.session))

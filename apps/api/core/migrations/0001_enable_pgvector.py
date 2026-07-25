"""Enable the pgvector extension before any vector columns are created.

This runs first (no dependencies) so later apps can declare VectorField
columns for semantic search / embeddings (a later phase).
"""

from django.db import migrations
from pgvector.django import VectorExtension


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        VectorExtension(),
    ]

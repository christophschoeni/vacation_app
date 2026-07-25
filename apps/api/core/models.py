"""Shared model base for all domain entities.

Every synced entity carries a client-stable UUID primary key, creation and
update timestamps, and a soft-delete marker. These are the columns the future
sync layer (Phase 3, field-based merge) needs: the app can create a row
offline with its own UUID, and deletions propagate as tombstones rather than
hard deletes so other devices can observe them.
"""

import uuid

from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Soft delete: set to a timestamp instead of deleting the row, so the sync
    # layer can propagate the deletion as a tombstone.
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        abstract = True

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

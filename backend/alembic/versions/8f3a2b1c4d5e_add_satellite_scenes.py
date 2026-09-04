"""add_satellite_scenes

Revision ID: 8f3a2b1c4d5e
Revises: 7e114bad7185
Create Date: 2026-09-01 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '8f3a2b1c4d5e'
down_revision: Union[str, None] = '7e114bad7185'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('satellite_scenes',
    sa.Column('project_id', sa.UUID(), nullable=False),
    sa.Column('scene_id', sa.String(), nullable=False),
    sa.Column('acquisition_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('cloud_cover_pct', sa.Float(), nullable=True),
    sa.Column('source', sa.String(), nullable=True),
    sa.Column('provider', sa.String(), nullable=True),
    sa.Column('ndvi_mean', sa.Float(), nullable=True),
    sa.Column('ndvi_min', sa.Float(), nullable=True),
    sa.Column('ndvi_max', sa.Float(), nullable=True),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('metadata_json', sa.JSON(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_index(op.f('ix_satellite_scenes_scene_id'), 'satellite_scenes', ['scene_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_satellite_scenes_scene_id'), table_name='satellite_scenes')
    op.drop_table('satellite_scenes')

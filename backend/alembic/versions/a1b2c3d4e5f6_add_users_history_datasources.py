"""add_users_history_and_datasources

Revision ID: a1b2c3d4e5f6
Revises: 925cb1b031db
Create Date: 2026-10-17 08:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '925cb1b031db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='citizen'),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Area Score History Table
    op.create_table(
        'area_score_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('area_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('evaluation_period', sa.String(), nullable=False),
        sa.Column('snapshot_id', sa.String(), nullable=True),
        sa.Column('indicators_breakdown', sa.JSON(), nullable=True),
        sa.Column('weights_breakdown', sa.JSON(), nullable=True),
        sa.Column('methodology_version', sa.String(), server_default='v1.0', nullable=True),
        sa.Column('recorded_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['area_id'], ['areas.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_area_score_history_id'), 'area_score_history', ['id'], unique=False)
    op.create_index(op.f('ix_area_score_history_area_id'), 'area_score_history', ['area_id'], unique=False)
    op.create_index(op.f('ix_area_score_history_evaluation_period'), 'area_score_history', ['evaluation_period'], unique=False)

    # 3. City Score History Table
    op.create_table(
        'city_score_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('evaluation_period', sa.String(), nullable=False),
        sa.Column('snapshot_id', sa.String(), nullable=True),
        sa.Column('area_breakdown', sa.JSON(), nullable=True),
        sa.Column('methodology_version', sa.String(), server_default='v1.0', nullable=True),
        sa.Column('recorded_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_city_score_history_id'), 'city_score_history', ['id'], unique=False)
    op.create_index(op.f('ix_city_score_history_evaluation_period'), 'city_score_history', ['evaluation_period'], unique=False)

    # 4. Data Sources Table
    op.create_table(
        'data_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('update_frequency', sa.String(), server_default='monthly', nullable=True),
        sa.Column('quality_flag', sa.String(), server_default='verified', nullable=True),
        sa.Column('status', sa.String(), server_default='active', nullable=True),
        sa.Column('records_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('last_synced_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_data_sources_id'), 'data_sources', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('data_sources')
    op.drop_table('city_score_history')
    op.drop_table('area_score_history')
    op.drop_table('users')

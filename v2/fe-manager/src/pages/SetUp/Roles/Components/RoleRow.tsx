import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Btn, Field, Input } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { roleColor } from '../../../../services/setup';
import type { Role } from '../../../../services/setup';

export function RoleRow({ role, isEditing, onEdit, onDelete, hasStaff, borderTop, totalHC }: {
  role: Role; isEditing: boolean; onEdit: () => void;
  onDelete: () => void; hasStaff: boolean;
  borderTop: boolean; totalHC: number;
}) {
  const { t } = useTranslation('setup');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pct = Math.round(role.snapshotUserCount / totalHC * 100);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '18px 24px', alignItems: 'center', borderTop: borderTop ? '1px solid #E8ECEF' : 'none' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D' }}>{role.name}</div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', marginBottom: 4 }}>{role.snapshotUserCount}</div>
          <div style={{ height: 4, background: '#E8ECEF', borderRadius: 2 }}>
            <div style={{ height: 4, background: roleColor(role), borderRadius: 2, width: `${pct}%` }}/>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setConfirmDelete(false); onEdit(); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4, color: '#6B7E8E' }}
          >
            <Icons.edit size={15}/>
          </button>
          <span title={hasStaff ? t('setup.roles.row.hasStaffTooltip', { count: role.snapshotUserCount }) : t('setup.roles.row.deleteTooltip')}>
            <button
              onClick={() => { if (!hasStaff) setConfirmDelete(v => !v); }}
              style={{
                background: 'transparent', border: 'none', padding: 6, borderRadius: 4,
                cursor: hasStaff ? 'not-allowed' : 'pointer',
                color: hasStaff ? '#C8D4DC' : confirmDelete ? '#DC2626' : '#6B7E8E',
                opacity: hasStaff ? 0.5 : 1,
              }}
            >
              <Icons.trash size={15}/>
            </button>
          </span>
        </div>
      </div>

      {isEditing && (
        <div style={{ margin: '0 24px 20px', padding: 20, background: '#F7F9FA', borderRadius: 8, border: '1px solid #E8ECEF' }}>
          <div style={{ marginBottom: 16 }}>
            <Field label={t('setup.roles.row.fieldName')}>
              <Input defaultValue={role.name}/>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" size="sm">{t('setup.roles.row.save')}</Btn>
            <Btn variant="ghost" size="sm" onClick={onEdit}>{t('setup.roles.row.cancel')}</Btn>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ margin: '0 24px 20px', padding: '14px 20px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.trash size={15} stroke="#DC2626"/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B' }}>{t('setup.roles.row.deleteTitle', { name: role.name })}</div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>{t('setup.roles.row.deleteWarning')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Btn variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>{t('setup.roles.row.cancel')}</Btn>
            <button
              onClick={() => { setConfirmDelete(false); onDelete(); }}
              style={{ padding: '6px 14px', background: '#DC2626', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
            >
              {t('setup.roles.row.deleteConfirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

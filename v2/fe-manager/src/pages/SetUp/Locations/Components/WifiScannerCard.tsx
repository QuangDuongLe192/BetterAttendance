import { useTranslation } from 'react-i18next';
import { Card, Btn, Eyebrow, Field, Input, Tag } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { type WifiNetwork } from '../../../../services/setup';

const BSSID_RE = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
const isValidBssid = (v: string) => v === '' || BSSID_RE.test(v);

export function WifiScannerCard({ networks, onNetworksChange, isEditing }: {
  locId: string;
  networks: WifiNetwork[];
  onNetworksChange: (n: WifiNetwork[]) => void;
  isEditing: boolean;
}) {
  const { t } = useTranslation('setup');
  const addBlank = () => onNetworksChange([...networks, { ssid: '', bssid: '' }]);
  const removeAt = (i: number) => onNetworksChange(networks.filter((_, idx) => idx !== i));
  const updateAt = (i: number, field: keyof WifiNetwork, val: string) =>
    onNetworksChange(networks.map((n, idx) => idx === i ? { ...n, [field]: val } : n));

  return (
    <Card pad={false} style={{ overflow: 'hidden' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #E8ECEF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Eyebrow>{t('setup.wifi.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', marginTop: 6 }}>
              {t('setup.wifi.title')}{' '}
              <span style={{ fontSize: 12, color: '#6B7E8E', fontWeight: 500 }}>{t('setup.wifi.networkCount', { count: networks.length })}</span>
            </h3>
          </div>
          {isEditing && (
            <Btn variant="ghost" size="sm" icon={<Icons.plus size={13} />} onClick={addBlank}>{t('setup.wifi.addBtn')}</Btn>
          )}
        </div>
      </div>

      {networks.length === 0 ? (
        <div style={{ padding: '32px 24px', color: '#C8D4DC', fontSize: 13, textAlign: 'center' }}>
          {isEditing
            ? <>{t('setup.wifi.empty')} — <button onClick={addBlank} style={{ color: '#00B4A0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{t('setup.wifi.emptyEdit')}</button></>
            : t('setup.wifi.empty')
          }
        </div>
      ) : (
        <div>
          {networks.map((net, i) => (
            <div key={i} style={{ padding: '14px 24px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', background: '#F0FAF7' }}>
              {isEditing ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#6B7E8E', letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('setup.wifi.networkLabel', { n: i + 1 })}</span>
                    <button onClick={() => removeAt(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#C8D4DC' }}>
                      <Icons.x size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label={t('setup.wifi.fieldSsid')}><Input value={net.ssid} onChange={v => updateAt(i, 'ssid', v)} placeholder="BetterCoffee-Store" mono /></Field>
                    <Field label={t('setup.wifi.fieldBssid')} hint={!isValidBssid(net.bssid) ? t('setup.wifi.bssidHint') : undefined}>
                      <Input
                        value={net.bssid}
                        onChange={v => updateAt(i, 'bssid', v.toUpperCase())}
                        placeholder="00:00:00:00:00:00"
                        mono
                        style={!isValidBssid(net.bssid) ? { borderColor: '#DC2626' } : undefined}
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: '#00B4A0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icons.wifi size={16} stroke="#fff" />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{net.ssid}</div>
                    <div style={{ fontSize: 11, color: '#6B7E8E' }}>BSSID {net.bssid}</div>
                  </div>
                  {net.bssid && isValidBssid(net.bssid)
                    ? <Tag tone="success" icon={<Icons.check size={10} />}>{t('setup.wifi.tagValid')}</Tag>
                    : <Tag tone="warning" icon={<Icons.alert size={10} />}>{t('setup.wifi.tagNoBssid')}</Tag>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

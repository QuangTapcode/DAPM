import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import receptionProfileApi from '../../api/receptionProfileApi';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import documentApi from '../../api/documentApi';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import {
  normalizeDocument,
  normalizeManagerProfile,
  PENDING_PROFILE_STATUSES,
} from './managerProfileUtils';

import userIcon from '../../assets/user.png';
import documentIcon from '../../assets/document.png';
import attachIcon from '../../assets/attach.png';

function Section({ iconSrc, title, children }) {
  return (
    <div className="section-card border border-blue-100 bg-[linear-gradient(180deg,#f8fcff_0%,#eef7ff_100%)]">
      <div className="section-card__header !bg-[linear-gradient(135deg,#daeeff_0%,#c8e8fa_45%,#dff4ff_100%)] !text-[#0D47A1]">
        <span className="inline-flex h-9 w-9 items-center justify-center">
          <img src={iconSrc} alt="" className="h-4 w-4 object-contain" />
        </span>
        <span className="text-sm font-bold text-[#0D47A1]">{title}</span>
      </div>
      <div className="section-card__body">{children}</div>
    </div>
  );
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Field({ label, value, className = '', highlight = false }) {
  return (
    <div className={className}>
      <div className="field-label uppercase tracking-wide !text-xs !font-semibold !text-[var(--c-text-secondary)]">
        {label}
      </div>
      <div
        className={`mt-1 text-sm leading-6 ${
          highlight ? 'font-semibold text-[var(--c-primary)]' : 'font-medium text-[var(--c-text)]'
        }`}
      >
        {value || '-'}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-5 border-t border-[var(--c-border-light)]" />;
}

function getInitials(name = 'Trẻ em') {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'TE'
  );
}

function NameAvatar({ name }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-[var(--c-primary)]">
      {getInitials(name)}
    </div>
  );
}

function ChildBlock({ profile }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 md:flex-row md:items-center">
      <NameAvatar name={profile.childName || 'Trẻ em'} />
      <div className="flex-1">
        <div className="text-base font-semibold text-[var(--c-text)]">
          {profile.childName || '-'}
        </div>
        <div className="mt-1 text-sm text-[var(--c-text-secondary)]">
          Mã trẻ #{profile.childId || '-'} · Ngày sinh {formatDate(profile.childDob)} ·{' '}
          {profile.childGender || '-'}
        </div>
      </div>
    </div>
  );
}

function buildFileUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const host = apiBase.replace(/\/api\/?$/i, '');
  return `${host}${url.startsWith('/') ? url : `/${url}`}`;
}

function DocRow({ doc }) {
  const fileUrl = buildFileUrl(doc.url);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--c-border-light)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
          <img src={doc.url ? documentIcon : attachIcon} alt="" className="h-4 w-4 object-contain opacity-90" />
        </span>
        <div>
          <p className="text-sm font-medium text-[var(--c-text)]">{doc.name}</p>
          <p className="mt-0.5 text-xs text-[var(--c-text-secondary)]">
            {doc.id} · {doc.type}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge status={doc.status} />
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[var(--c-primary)] transition hover:bg-blue-100"
          >
            Xem file
          </a>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = 'secondary',
  loading = false,
  disabled = false,
  type = 'button',
}) {
  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const variantClass = {
    approve: 'bg-[var(--c-success)] text-white hover:brightness-95',
    reject: 'border border-red-200 bg-white text-[var(--c-danger)] hover:bg-red-50',
    secondary: 'border border-[var(--c-border)] bg-white text-[var(--c-primary-dark)] hover:bg-gray-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass[variant] || variantClass.secondary}`}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
}

export default function ProfileApproval() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const isAdoption = type === 'adoption';
  const api = isAdoption ? adoptionProfileApi : receptionProfileApi;

  const { data: rawProfile, loading, error, refetch } = useFetch(() => api.getById(id));
  const profile = useMemo(
    () => (rawProfile ? normalizeManagerProfile(rawProfile, isAdoption ? 'adoption' : 'reception') : null),
    [isAdoption, rawProfile]
  );

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      if (!profile?.requestId) {
        setDocuments([]);
        return;
      }

      try {
        setDocumentsLoading(true);
        setDocumentsError('');
        const params = isAdoption
          ? { maYeuCauNhan: profile.requestId }
          : { maYeuCauGuiTre: profile.requestId };
        const result = await documentApi.getAll(params);
        if (!cancelled) setDocuments((result ?? []).map(normalizeDocument));
      } catch (err) {
        if (!cancelled) {
          setDocuments([]);
          setDocumentsError(err?.message || 'Không tải được danh sách giấy tờ.');
        }
      } finally {
        if (!cancelled) setDocumentsLoading(false);
      }
    }

    loadDocuments();
    return () => {
      cancelled = true;
    };
  }, [isAdoption, profile?.requestId]);

  const handleApprove = async () => {
    try {
      setSaving(true);
      setActionError('');
      await api.approve(id);
      await refetch();
      navigate('/truong-phong/cho-duyet');
    } catch (err) {
      setActionError(err?.message || 'Phê duyệt hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;

    try {
      setSaving(true);
      setActionError('');
      await api.reject(id, reason.trim());
      await refetch();
      setRejectModal(false);
      navigate('/truong-phong/cho-duyet');
    } catch (err) {
      setActionError(err?.message || 'Từ chối hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-secondary)]">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-secondary)]">
        {error || 'Không tìm thấy hồ sơ.'}
      </div>
    );
  }

  const canAct = PENDING_PROFILE_STATUSES.includes(profile.status);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1720px]">
        <div className="card mb-4 border border-[var(--c-border-light)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
                <span>Mã hồ sơ</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[var(--c-primary)] normal-case">
                  {profile.id || id}
                </span>
              </div>
              <h1 className="text-xl font-bold text-[var(--c-text)] sm:text-2xl">
                {isAdoption ? 'Hồ sơ xét duyệt nhận con nuôi' : 'Hồ sơ xét duyệt tiếp nhận trẻ'}
              </h1>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
                Trạng thái
              </span>
              <Badge
                status={profile.status}
                size="md"
                label={canAct ? 'Đang thẩm định' : undefined}
              />
              {profile.officerName && (
                <div className="text-sm text-[var(--c-text-secondary)]">
                  Cán bộ lập: <span className="font-semibold text-[var(--c-text)]">{profile.officerName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {isAdoption ? (
          <>
            <Section iconSrc={userIcon} title="Thông tin người nhận nuôi">
              <FieldGrid>
                <Field label="Họ và tên" value={profile.adopterName} />
                <Field label="Số điện thoại" value={profile.phone} />
              </FieldGrid>
              <Divider />
              <FieldGrid>
                <Field
                  label="Thu nhập hằng tháng"
                  value={
                    profile.monthlyIncome
                      ? `${Number(profile.monthlyIncome).toLocaleString('vi-VN')} VND`
                      : ''
                  }
                  highlight
                />
                <Field label="Nghề nghiệp" value={profile.occupation} />
              </FieldGrid>
            </Section>

            <Section iconSrc={documentIcon} title="Nội dung yêu cầu nhận nuôi">
              <FieldGrid>
                <Field label="Lý do nhận nuôi" value={profile.motivation} />
                <Field label="Mong muốn về trẻ" value={profile.childExpectation} />
              </FieldGrid>
              <Divider />
              <FieldGrid>
                <Field label="Mã yêu cầu" value={profile.requestId} />
                <Field label="Ngày lập hồ sơ" value={formatDate(profile.createdAt)} />
              </FieldGrid>
            </Section>

            <Section iconSrc={userIcon} title="Thông tin trẻ được nhận nuôi">
              <ChildBlock profile={profile} />
            </Section>
          </>
        ) : (
          <>
            <Section iconSrc={documentIcon} title="Thông tin hồ sơ tiếp nhận">
              <FieldGrid>
                <Field label="Tên trẻ" value={profile.childName} />
                <Field label="Ngày sinh" value={formatDate(profile.childDob)} />
              </FieldGrid>
              <Divider />
              <FieldGrid>
                <Field label="Giới tính" value={profile.childGender} />
                <Field label="Người gửi" value={profile.senderName} />
              </FieldGrid>
              <Divider />
              <FieldGrid>
                <Field label="Quan hệ với trẻ" value={profile.senderRelation} />
                <Field label="Ngày tiếp nhận" value={formatDate(profile.createdAt)} />
              </FieldGrid>
              <Divider />
              <Field label="Lý do gửi trẻ" value={profile.reason} />
            </Section>

            <Section iconSrc={userIcon} title="Trẻ trong hệ thống">
              <ChildBlock profile={profile} />
            </Section>
          </>
        )}

        <Section iconSrc={attachIcon} title="Danh sách giấy tờ đính kèm">
          <div className="flex flex-col gap-3">
            {documentsLoading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Đang tải giấy tờ...
              </div>
            )}
            {documentsError && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {documentsError}
              </div>
            )}
            {!documentsLoading && documents.length === 0 && (
              <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
                Chưa có giấy tờ đính kèm từ API.
              </div>
            )}
            {documents.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </div>
        </Section>

        <div className="card flex flex-col gap-3 border border-[var(--c-border-light)] p-4 sm:flex-row sm:items-center">
          <ActionBtn variant="secondary" onClick={() => navigate(-1)}>
            Quay lại
          </ActionBtn>
          <div className="hidden flex-1 sm:block" />
          {canAct && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionBtn variant="reject" onClick={() => setRejectModal(true)} disabled={saving}>
                Từ chối
              </ActionBtn>
              <ActionBtn variant="approve" onClick={handleApprove} loading={saving}>
                Đồng ý duyệt
              </ActionBtn>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Từ chối hồ sơ">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--c-text-secondary)]">
            Nhập lý do từ chối để lưu vào ghi chú hồ sơ.
          </p>
          <textarea
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Nhập lý do từ chối..."
            className="field-input resize-y"
          />
          <div className="flex justify-end gap-3">
            <ActionBtn variant="secondary" onClick={() => setRejectModal(false)}>
              Hủy
            </ActionBtn>
            <ActionBtn
              variant="reject"
              onClick={handleReject}
              loading={saving}
              disabled={!reason.trim()}
            >
              Xác nhận từ chối
            </ActionBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

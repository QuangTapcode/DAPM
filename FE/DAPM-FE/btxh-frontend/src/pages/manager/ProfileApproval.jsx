import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import adoptionApi from '../../api/adoptionApi';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { REQUEST_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

import userIcon from '../../assets/user.png';
import documentIcon from '../../assets/document.png';
import attachIcon from '../../assets/attach.png';

function getInitials(name = 'Trẻ em') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'TE';
}

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
        className={`mt-1 text-sm leading-6 ${highlight
          ? 'font-semibold text-[var(--c-primary)]'
          : 'font-medium text-[var(--c-text)]'
          }`}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-5 border-t border-[var(--c-border-light)]" />;
}

function NameAvatar({ name, src }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        onError={() => setImgError(true)}
        className="h-14 w-14 shrink-0 rounded-xl border border-blue-100 object-cover"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-[var(--c-primary)]">
      {initials}
    </div>
  );
}

function ChildBlock({ profile }) {
  const childAvatar =
    profile.childAvatar ||
    profile.childAvatarUrl ||
    profile.childImage ||
    profile.avatar ||
    profile.imageUrl ||
    '';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 md:flex-row md:items-center">
      <NameAvatar name={profile.childName || 'Trẻ em'} src={childAvatar} />

      <div className="flex-1">
        <div className="text-base font-semibold text-[var(--c-text)]">
          {profile.childName ?? '—'}
        </div>

        <div className="mt-1 text-sm text-[var(--c-text-secondary)]">
          Mã trẻ #{profile.childId ?? '—'} · {profile.childAge ?? '—'} tuổi ·{' '}
          {profile.childGender ?? '—'}
        </div>
      </div>
    </div>
  );
}

function DocRow({ name, status, fileUrl }) {
  const uploaded = status === 'uploaded';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--c-border-light)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${uploaded ? 'bg-green-100' : 'bg-amber-100'
            }`}
        >
          <img
            src={uploaded ? documentIcon : attachIcon}
            alt=""
            className="h-4 w-4 object-contain opacity-90"
          />
        </span>

        <span className="text-sm font-medium text-[var(--c-text)]">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${uploaded
            ? 'bg-green-50 text-[var(--c-success)]'
            : 'bg-amber-50 text-[var(--c-warning)]'
            }`}
        >
          {uploaded ? 'Đã tải lên' : 'Chưa có'}
        </span>

        {uploaded && fileUrl && (
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
    reject:
      'border border-red-200 bg-white text-[var(--c-danger)] hover:bg-red-50',
    secondary:
      'border border-[var(--c-border)] bg-white text-[var(--c-primary-dark)] hover:bg-gray-50',
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

  const api = type === 'reception' ? receptionApi : adoptionApi;
  const isAdopt = type === 'adoption';

  const { data: profile, loading, refetch } = useFetch(() => api.getById(id));

  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleApprove = async () => {
    try {
      setSaving(true);
      await api.approve(id);
      await refetch();
      navigate('/truong-phong/cho-duyet');
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;

    try {
      setSaving(true);
      await api.reject(id, reason.trim());
      await refetch();
      setRejectModal(false);
      navigate('/truong-phong/cho-duyet');
    } catch (error) {
      console.error('Reject failed:', error);
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

  if (!profile) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-secondary)]">
        Không tìm thấy hồ sơ.
      </div>
    );
  }

  const canAct = profile.status === REQUEST_STATUS.PENDING;

  const docs = profile.documents ?? [
    { name: 'Bản sao CCCD người nhận nuôi', status: 'uploaded' },
    { name: 'Giấy khám sức khỏe tổng quát', status: 'uploaded' },
    { name: 'Giấy chứng nhận thu nhập & Tài chính', status: 'uploaded' },
    { name: 'Tình trạng hôn nhân', status: 'missing' },
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 ">
      <div className="mx-auto  max-w-[1720px]">
        <div className="card mb-4 border border-[var(--c-border-light)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
                <span>Mã hồ sơ</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[var(--c-primary)] normal-case">
                  {profile.requestCode ?? id}
                </span>
              </div>

              <h1 className="text-xl font-bold text-[var(--c-text)] sm:text-2xl">
                {isAdopt ? 'Hồ sơ xét duyệt nhận con nuôi' : 'Hồ sơ yêu cầu gửi trẻ'}
              </h1>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
                Trạng thái
              </span>

              <Badge
                status={profile.status}
                size="md"
                label={
                  profile.status === REQUEST_STATUS.PENDING
                    ? 'Đang thẩm định'
                    : undefined
                }
              />

              {profile.assignee && (
                <div className="text-sm text-[var(--c-text-secondary)]">
                  Người phụ trách:{' '}
                  <span className="font-semibold text-[var(--c-text)]">
                    {profile.assignee}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isAdopt && (
          <>
            <Section iconSrc={userIcon} title="Thông tin người nhận nuôi">
              <FieldGrid>
                <Field label="Họ và tên" value={profile.adopterName} />
                <Field label="Số CCCD" value={profile.nationalId} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field
                  label="Thu nhập hàng tháng"
                  value={
                    profile.monthlyIncome
                      ? `${Number(profile.monthlyIncome).toLocaleString('vi-VN')} VND`
                      : undefined
                  }
                  highlight
                />
                <Field label="Số điện thoại" value={profile.phone} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Email" value={profile.email} />
                <Field label="Giới tính" value={profile.gender} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Ngày sinh" value={formatDate(profile.dob)} />
                <Field label="Địa chỉ thường trú" value={profile.address} />
              </FieldGrid>
            </Section>

            <Section iconSrc={documentIcon} title="Nội dung yêu cầu">
              <FieldGrid>
                <Field label="Lý do nhận nuôi" value={profile.motivation} />
                <Field label="Mong muốn về trẻ" value={profile.childExpectation} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Nghề nghiệp" value={profile.occupation} />
                <Field label="Ngày nộp đơn" value={formatDate(profile.createdAt)} />
              </FieldGrid>
            </Section>

            <Section iconSrc={userIcon} title="Thông tin trẻ em được nhận nuôi">
              <ChildBlock profile={profile} />
            </Section>
          </>
        )}

        {!isAdopt && (
          <>
            <Section iconSrc={documentIcon} title="Thông tin gửi trẻ">
              <FieldGrid>
                <Field label="Tên trẻ" value={profile.childName} />
                <Field label="Ngày sinh" value={formatDate(profile.childDob)} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Giới tính" value={profile.childGender} />
                <Field label="Sức khỏe" value={profile.healthStatus} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Người giao" value={profile.senderName} />
                <Field label="Quan hệ với trẻ" value={profile.senderRelation} />
              </FieldGrid>

              <Divider />

              <FieldGrid>
                <Field label="Lý do gửi trẻ" value={profile.reason} />
                <Field label="Ngày nộp hồ sơ" value={formatDate(profile.createdAt)} />
              </FieldGrid>
            </Section>

            <Section iconSrc={userIcon} title="Trẻ trong hệ thống">
              <ChildBlock profile={profile} />
            </Section>
          </>
        )}

        <Section iconSrc={attachIcon} title="Danh sách tài liệu đính kèm">
          <div className="flex flex-col gap-3">
            {docs.map((doc, index) => (
              <DocRow
                key={index}
                name={doc.name}
                status={doc.status}
                fileUrl={doc.url}
              />
            ))}
          </div>
        </Section>

        <div className="card flex flex-col gap-3 border border-[var(--c-border-light)] p-4 sm:flex-row sm:items-center">
          <ActionBtn variant="secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </ActionBtn>

          <div className="hidden flex-1 sm:block" />

          {canAct && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionBtn variant="reject" onClick={() => setRejectModal(true)}>
                ✕ Từ chối
              </ActionBtn>
              <ActionBtn variant="approve" onClick={handleApprove} loading={saving}>
                ✓ Đồng ý duyệt
              </ActionBtn>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Từ chối hồ sơ"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--c-text-secondary)]">
            Vui lòng nhập lý do từ chối để thông báo đến người nộp hồ sơ.
          </p>

          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
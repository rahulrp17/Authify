import { Button } from './Button';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  loading = false,
  variant = 'danger',
  children,
}) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {children}
  </Modal>
);

import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color--gray-6);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: 14px;
    font-weight: 600;
    color: var(--color--black);
  }

  small {
    font-size: 12px;
    color: var(--color--black-6);
  }
`

const Control = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  input,
  textarea,
  select {
    width: 100%;
    padding: 8px 9px;
    border-radius: 0;
    border: 1px solid var(--color--gray-5);
    font-size: 14px;
    background: #fff;
    transition: border-color 120ms ease, background 120ms ease;
  }

  textarea {
    min-height: 96px;
    resize: vertical;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: var(--color--black-4);
    background: #fff;
    outline: none;
  }
`

const Error = styled.span`
  font-size: 12px;
  color: var(--color--primary);
`

export default function FieldRow({
  label,
  hint,
  error,
  htmlFor,
  children
}) {
  return (
    <Row>
      <Label htmlFor={htmlFor}>
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
        {error ? <Error role="alert">{error}</Error> : null}
      </Label>
      <Control>
        {children}
      </Control>
    </Row>
  )
}

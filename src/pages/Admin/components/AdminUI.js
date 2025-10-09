import styled, { css } from 'styled-components'

export const SectionHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

export const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--color--black-2);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--color--black-5);
    max-width: 520px;
  }
`

export const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone = 'default' }) => $tone === 'success' ? 'var(--color--green)' : $tone === 'warning' ? 'var(--color--primary-light)' : 'var(--color--black-5)'};
`

export const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

export const PrimaryButton = styled.button`
  padding: 9px 14px;
  border-radius: 0;
  border: 1px solid var(--color--black-3);
  background: var(--color--black-2);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`

export const SecondaryButton = styled.button`
  padding: 9px 14px;
  border-radius: 0;
  border: 1px solid var(--color--gray-5);
  background: #fafafa;
  color: var(--color--black-4);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`

export const SearchField = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 0;
  border: 1px solid var(--color--gray-5);
  padding: 0 12px;
  min-width: 220px;
  flex: 1;
  max-width: 320px;

  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 12px 0 12px 30px;
    font-size: 14px;
    color: var(--color--black-3);
  }

  input::placeholder {
    color: var(--color--black-6);
  }

  svg {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--color--black-5);
  }
`

export const CounterPill = styled.span`
  padding: 4px 8px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--color--gray-6);
  background: #fff;
  color: var(--color--black-4);
`

export const ChipGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const ChipButton = styled.button`
  padding: 6px 10px;
  border-radius: 0;
  border: 1px solid var(--color--gray-5);
  background: #fff;
  font-size: 12px;
  color: var(--color--black-4);
  cursor: pointer;

  ${({ $active }) => $active && css`
    background: #f0f0f0;
    border-color: var(--color--gray-4);
    color: var(--color--black-2);
  `}
`

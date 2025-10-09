import { useState } from 'react'
import styled from 'styled-components'

const SectionWrapper = styled.section`
  background: var(--color--white);
  border: 1px solid var(--color--gray-6);
  border-radius: 0;
  margin-bottom: 8px;
`

const Header = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: ${({ $open }) => ($open ? 'var(--color--white-2)' : 'var(--color--white)')};
  border-bottom: 1px solid var(--color--gray-6);
  cursor: ${({ $collapsible }) => ($collapsible ? 'pointer' : 'default')};
  text-align: left;
`

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color--black-2);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  span {
    font-size: 12px;
    color: var(--color--black-5);
  }
`

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 0;
  border: 1px solid var(--color--primary);
  background: transparent;
  color: var(--color--primary);
  font-size: 11px;
  text-transform: uppercase;
`;

const ToggleIcon = styled.span`
  font-size: 18px;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 160ms ease;
`

const Body = styled.div`
  padding: 12px 14px 14px 14px;
  display: ${({ $open, $collapsible }) => ($collapsible ? ($open ? 'block' : 'none') : 'block')};
`

export default function FormSection({
  title,
  description,
  required = false,
  defaultOpen = true,
  open,
  onToggle,
  collapsible = true,
  children
}) {
  const isControlled = collapsible && typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const resolvedOpen = collapsible ? (isControlled ? open : internalOpen) : true

  const handleToggle = () => {
    if (!collapsible) return
    if (isControlled) {
      onToggle?.(!resolvedOpen)
    } else {
      setInternalOpen(prev => {
        const next = !prev
        onToggle?.(next)
        return next
      })
    }
  }

  return (
    <SectionWrapper>
      <Header
        as={collapsible ? 'button' : 'div'}
        type={collapsible ? 'button' : undefined}
        onClick={collapsible ? handleToggle : undefined}
        $open={resolvedOpen}
        $collapsible={collapsible}
        aria-expanded={collapsible ? resolvedOpen : undefined}
      >
        <Title>
          <h3>
            {title}
            {required ? <Pill>Obrigatório</Pill> : null}
          </h3>
          {description ? <span>{description}</span> : null}
        </Title>
        {collapsible ? <ToggleIcon $open={resolvedOpen}>▾</ToggleIcon> : null}
      </Header>
      <Body $open={resolvedOpen} $collapsible={collapsible}>
        {children}
      </Body>
    </SectionWrapper>
  )
}

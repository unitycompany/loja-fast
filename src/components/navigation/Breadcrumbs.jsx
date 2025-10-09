import { CaretRightIcon, HouseIcon } from "@phosphor-icons/react/dist/ssr";
import styled from "styled-components";
import { go } from "../../utils/url";

const Container = styled.nav`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap; /* keep everything on one line */

    & ul {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 2px;
        flex-wrap: nowrap; /* no wrapping across lines */
        overflow: hidden; /* enable truncation in the last item */

        & li {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 400;
            line-height: 100%;
            cursor: pointer;
            white-space: nowrap; /* each crumb is a single line */

            &:hover {
                & span {
                    color: var(--color--primary);
                }
            }

            & span {
                padding: 0 4px;
                transition: all 0.3s ease;
                color: var(--color--black-2);

                @media (max-width: 768px) {
                    font-size: 14px;
                }
            }

            & svg {
                font-size: 14px;
                cursor: default;
                pointer-events: none;
                rotate: 2deg;
                color: var(--color--black-2);

                @media (max-width: 768px) {
                    font-size: 12px;
                }
            }

            /* Allow the last crumb (current page) to shrink and show ellipsis */
            &:last-child {
                flex: 1 1 auto;
                min-width: 0; /* allow overflow hidden to take effect */
                justify-content: flex-start; /* left-align inside */

                & span {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: inline-block; /* needed for max-width + ellipsis */
                }
            }
        }
    }
`

export default function Breadcrumbs({
    pages = []
}) {
    return (
        <>
            <Container>
                <ul>
                    <li onClick={() => go('/') }>
                        <span>Ínicio</span>
                    </li>
                    {pages.map((page, index) => {
                        const isLast = index === pages.length - 1
                        return (
                            <li key={index} onClick={() => go(`/${page.link}`)}>
                                <CaretRightIcon weight="regular" />
                                <span title={page.route}>{page.route}</span>
                            </li>
                        )
                    })}
                </ul>
            </Container>
        </>
    )
}
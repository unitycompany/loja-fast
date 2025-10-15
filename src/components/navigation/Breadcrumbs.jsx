import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import styled from "styled-components";
import { go } from "../../utils/url";

const Container = styled.nav`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        white-space: normal;
        overflow-x: visible;
    }

    & ul {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 2px;
        flex-wrap: nowrap;
        overflow: hidden;

        @media (max-width: 768px) {
            flex-wrap: wrap;
            row-gap: 6px;
        }

        & li {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 400;
            line-height: 100%;
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;

            @media (max-width: 768px) {
                font-size: 12px;
                white-space: normal;
                flex: 0 1 auto;
                max-width: 100%;
            }

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
                    font-size: 12px;
                }
            }

            & svg {
                font-size: 14px;
                cursor: default;
                pointer-events: none;
                rotate: 2deg;
                color: var(--color--black-2);

                @media (max-width: 768px) {
                    font-size: 10px;
                }
            }

            &:last-child {
                flex: 1 1 auto;
                min-width: 0;
                justify-content: flex-start;
                cursor: default;
                pointer-events: none;

                & span {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: inline-block;

                    @media (max-width: 768px) {
                        white-space: normal;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    }
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
                        const handleClick = () => {
                            if (isLast) return
                            go(`/${page.link}`)
                        }
                        return (
                            <li
                                key={index}
                                onClick={handleClick}
                                aria-current={isLast ? "page" : undefined}
                            >
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
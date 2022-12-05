import styled from 'styled-components'

const StyledTranslationBottomUp = styled.div`
    background: #fff;
    border: 2px solid #dc3545;
    display: block;
    opacity: 0;
    overflow: scroll;

    position: fixed;
    bottom: -100%;
    left: -100%;
    z-index: 1;
    user-select: none;

    width: 100%;
    max-height: 45%;

    header {
        background-color: #dc3545;
        color: #fff;
        display: block;
        padding: 4px 8px;

        position: fixed;
        width: 100%;

        .btnClose {
            cursor: pointer;
            display: block;
            padding: 0 4px;
        }

        & + div {
            margin-top: 2rem;
        }
    }

    a {
        cursor: pointer;
    }

    .translatedFrom,
    .translatedFrom a,
    .translatedFrom a:hover {
        color: #666;
        font-size: 10px;
        text-decoration: none;
    }

    &.show {
        opacity: 1;
        bottom: 0;
        left: 0;
    }
`

export { StyledTranslationBottomUp }

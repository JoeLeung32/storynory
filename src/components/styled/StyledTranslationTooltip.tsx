import styled from 'styled-components'

const StyledTranslationTooltip = styled.div`
    background: #fff;
    border: 2px solid #dc3545;
    border-radius: 10px;
    box-shadow: 0.5rem 0.5rem 0 rgba(220, 53, 69, 50%);
    display: block;
    opacity: 0;

    position: absolute;
    top: -100%;
    left: -100%;
    z-index: 1;
    user-select: none;

    max-width: 99.9%;

    header {
        background-color: #dc3545;
        color: #fff;
        display: block;
        padding: 4px 8px;

        .btnClose {
            cursor: pointer;
            display: block;
            padding: 0 4px;
        }
    }

    a,
    a:hover,
    .translatedFrom {
        color: #666;
        font-size: 10px;
        text-decoration: none;
    }

    &.show {
        opacity: 1;
    }
`

export { StyledTranslationTooltip }

import styled from '@emotion/styled';

export const IssueContainer = styled.div`
  position: relative;
  margin: 0.5em 0;
  display: flex;
  border-radius: 10px;
`;

export const IssueContent = styled.div`
  flex: 1 1;
  padding: 16px 20px 0px;
  margin: 6px;
  overflow: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0.1em 0.2em 0 var(--shadow);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-size: 15px;
  z-index: 2;

  /* border: 1px solid rgb(212, 212, 216); */
  /* box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.15) 2px 0px 8px 0px; */

  /* &:hover { */
  /* box-shadow: 0 0.2em 0.3em 0.1em rgba(200, 200, 200, 0.4); */
  /* transform: translateY(-1px); */
  /* }
`;

export const IssueHeader = styled.div`
  margin-bottom: 0.7em;
  font-size: 1em;
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* gap: 0.2em; */
`;

export const IssueBody = styled.div`
  color: var(--text);
  &.markdown-body {
    font-size: 1em;
    letter-spacing: 0.2px;
    word-wrap: break-word;
    background-color: transparent;
    /* background: hsla(0, 0%, 100%, 0.8); */
    ol {
      list-style: decimal !important;
    }
    ul {
      list-style: circle !important;
    }
  }
`;

export const IssueFooter = styled.div`
  position: relative;
  margin-top: 0.8em;
  font-size: 1em;
  user-select: none;
`;

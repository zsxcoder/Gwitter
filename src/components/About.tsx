import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import '../lib/collapse.js';
import { api, getLabelsQL } from '../utils/request';
import Label from './Label';

const banLabels = ['dependencies'];

interface Label {
  name: string;
  color: string;
}

type AboutProps = {
  owner: string;
  repo: string;
};

const summaryColor = 'var(--text-secondary)';

const AboutContainer = styled.div`
  user-select: none;
  padding: 16px 20px;
  transition: all 0.25s ease;
  border-radius: 10px;
  background: var(--card);
  font-size: 1em;
  letter-spacing: 1px;
  border: 1px solid var(--border);
  box-shadow: 0 0.1em 0.2em 0 var(--shadow);
  margin: 6px;
  margin-bottom: 1em;

  ol {
    list-style: decimal !important;
  }

  ul {
    list-style: circle !important;
  }

  code {
    background: rgba(232, 125, 143, 0.15);
    color: var(--error);
  }

  summary {
    cursor: pointer;
    font-size: 1.1em;

    &:focus {
      outline: none;
    }
  }

  summary::-webkit-details-marker {
    display: none;
  }

  a {
    color: var(--primary);
    box-shadow: inset 0 -3px rgba(143, 99, 233, 0.3);
    font-weight: 700;
    text-decoration: none;
    transition: 0.2s;
  }

  a:hover,
  a:focus {
    box-shadow: inset 0 -1.2em var(--primary);
    color: var(--background);
  }

  p {
    margin-top: 0;
    margin-bottom: 1em;
  }

  p:last-child {
    margin-bottom: 0;
  }

  .about-title {
    font-size: 1.3em;
    margin-bottom: 0.3em;
    text-align: center;
  }

  abbr {
    font-variant: small-caps;
    text-transform: lowercase;
    font-size: 1.2em;
  }

  [type='checkbox'] {
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
  }

  [type='checkbox'] + label {
    background: var(--card-secondary);
    border-left: 4px solid ${summaryColor};
    cursor: pointer;
    display: block;
    font-size: 1em;
    font-weight: 700;
    text-align: left;
    transition: 0.1s;
    padding: 0.75em 1em;
  }

  [type='checkbox'] + label::before {
    border: 2px solid;
    border-radius: 2px;
    color: ${summaryColor};
    content: '';
    display: inline-block;
    margin-right: 0.75ch;
    transition: 0.1s;
    width: 1ch;
    height: 1ch;
    vertical-align: baseline;
  }

  [type='checkbox']:focus + label {
    outline: 2px solid ${summaryColor};
  }

  [type='checkbox']:checked + label::before {
    background: currentColor;
    box-shadow: inset 0 0 0 2px #fff;
  }

  .container {
    box-shadow: 0.2em 1em 2em -1em var(--shadow);
    margin: 2.4em 0;
  }

  details {
    border-bottom: 2px solid var(--border);
    list-style: none;
  }

  summary {
    display: block;
    transition: 0.2s;
    padding: 1em;

    &:hover {
      background-color: var(--hover);
    }
  }

  summary:focus {
    outline: none;
  }

  summary::after {
    border-right: 2px solid;
    border-bottom: 2px solid;
    content: '';
    float: right;
    width: 0.5em;
    height: 0.5em;
    margin-top: 0.25em;
    transform: rotate(45deg);
    transition: inherit;
    border-color: ${summaryColor};
  }

  [open] summary {
    background: var(--primary);
    color: var(--background);
    font-size: 1.15em;
  }

  [open] summary::after {
    border-color: var(--background);
  }

  [open] summary::after {
    margin-top: 0.5em;
    transform: rotate(225deg);
  }

  /* Collapse styles */
  &.collapse-init summary + * {
    transition: all 0.25s ease-in-out;
    overflow: hidden;
  }

  &.collapse-init :not(.panel-active) summary + * {
    height: 0;
    opacity: 0;
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
    transform-origin: bottom center;
  }

  &.collapse-init summary {
    list-style: none;
  }

  &.collapse-init summary::-webkit-details-marker {
    display: none;
  }

  &.collapse-init summary::before {
    display: none;
  }

  &.collapse-init summary {
    cursor: pointer;
  }

  .details-styling {
    padding: 1em;
  }
`;

const About = ({ owner, repo }: AboutProps) => {
  const [labels, setLabels] = useState<Label[] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let makeMePretty = document.querySelector('.collapse');
    new Collapse(makeMePretty, { accordion: true }).init();

    const fetchLabels = async () => {
      try {
        const response = await api.post(
          '/graphql',
          getLabelsQL({ owner, repo }),
        );
        const fetchedLabels = response?.data?.data?.repository?.labels?.nodes;

        if (Array.isArray(fetchedLabels)) {
          const filteredLabels = fetchedLabels.filter(
            (label) => !banLabels.includes(label.name),
          );
          setLabels(filteredLabels);
        }
      } catch (error) {
        console.error('Failed to fetch labels:', error);
      }
    };

    fetchLabels();
  }, [owner, repo]);

  return (
    <AboutContainer className="collapse">
      <div className="about-title">{t('about.title')}</div>

      <details>
        <summary>{t('about.gwitter.title')}</summary>
        <div>
          <div className="details-styling">
            <p>{t('about.gwitter.description')}</p>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('about.content.title')}</summary>
        <div>
          <div className="details-styling">
            <p>
              {t('about.content.categories', { count: labels?.length || 0 })}
            </p>
            <div>
              {labels?.map((label, index) => (
                <Label
                  style={{ margin: '6px' }}
                  name={label.name}
                  color={label.color}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('about.subscription.title')}</summary>
        <div>
          <div className="details-styling">
            <ul>
              <li>
                <code>{t('about.subscription.watch')}</code>&nbsp;
                <a
                  href="https://github.com/zsxcoder/weibo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.repo')}
                </a>
              </li>
              {/* <li>
                <code>{t('about.subscription.join')}</code>&nbsp;
                <a
                  href="https://thinking.simonaking.com/#ru-kou"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.wechat')}
                </a>
              </li> */}
              <li>
                <code>{t('about.subscription.join')}</code>&nbsp;
                <a
                  href="https://t.me/kemiaofx_me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.telegram')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </details>
    </AboutContainer>
  );
};

export default About;

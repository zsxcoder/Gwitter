import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import NumberFlow from '@number-flow/react';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  addReactionToIssue,
  createAuthenticatedApi,
  removeReactionFromIssue,
} from '../utils/request';
import CommentList from './CommentList';

const COLORS = {
  primary: 'var(--text-secondary)',
  like: '#f91880',
  comment: '#1d9bf0',
  likeHover: 'rgba(249, 24, 128, 0.15)',
  commentHover: 'rgba(29, 161, 242, 0.15)',
} as const;

const heartPop = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
`;

const particleFlyOut = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--particle-x), var(--particle-y)) scale(0) rotate(var(--particle-rotation));
    opacity: 0;
  }
`;

const Particle = styled.div<{
  delay: string;
  duration: string;
  x: string;
  y: string;
  color: string;
  size: string;
  initialScale: number;
  initialRotation: string;
  shape: 'circle' | 'heart';
}>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  background-color: ${(props) =>
    props.shape === 'circle' ? props.color : 'transparent'};
  border-radius: ${(props) => (props.shape === 'circle' ? '50%' : '0')};
  pointer-events: none;
  opacity: 0;
  transform-origin: center;
  transform: translate(-50%, -50%) scale(${(props) => props.initialScale})
    rotate(${(props) => props.initialRotation});
  animation: ${particleFlyOut} ${(props) => props.duration} ease-out forwards;
  animation-delay: ${(props) => props.delay};
  --particle-x: ${(props) => props.x};
  --particle-y: ${(props) => props.y};
  --particle-rotation: ${(props) => Math.random() * 180 - 90}deg;

  ${(props) =>
    props.shape === 'heart' &&
    `
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: calc(${props.size} / 2);
      top: 0;
      width: calc(${props.size} / 2);
      height: ${props.size};
      background: ${props.color};
      border-radius: calc(${props.size} / 2) calc(${props.size} / 2) 0 0;
      transform: rotate(-45deg);
      transform-origin: 0 100%;
    }
    &::after {
      left: 0;
      transform: rotate(45deg);
      transform-origin: 100% 100%;
    }
  `}
`;

interface InteractionProps {
  id: number;
  issueId: string; // GitHub node ID
  reactions: {
    totalCount: number;
    userReacted: boolean;
    heartCount: number;
  };
  comments: {
    totalCount: number;
  };
  repoOwner?: string;
  repoName?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* margin-top: 10px; */
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  margin-left: -8px;
`;

const NumberContainer = styled.span<{ $isVisible: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  overflow: hidden;
  transition:
    color 0.2s,
    opacity 0.2s,
    transform 0.2s;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: ${(props) => (props.$isVisible ? 'scale(1)' : 'scale(0.8)')};
  pointer-events: ${(props) => (props.$isVisible ? 'auto' : 'none')};
`;

const InteractionButton = styled.button`
  display: flex;
  align-items: center;
  color: ${COLORS.primary};
  background: none;
  border: none;
  padding: 8px 0px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 400;
  border-radius: 20px;
  min-width: 0;
  position: relative;
  width: 50px;

  span {
    font-size: 13px;
    transition: color 0.2s;
    min-width: 0;
    position: relative;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0);
    border: 0 solid black;
    box-sizing: border-box;
    display: inline;
    font: inherit;
    list-style: none;
    margin: 0px;
    padding: 0px;
    position: relative;
    text-align: inherit;
    text-decoration: none;
    white-space: inherit;
    word-wrap: break-word;
  }

  &.liked {
    .icon-container svg {
      color: ${COLORS.like};
      fill: ${COLORS.like};
    }

    .number-container {
      color: ${COLORS.like};
    }

    .icon-container:hover {
      svg {
        color: ${COLORS.like};
        fill: ${COLORS.like};
      }

      &::before {
        background: ${COLORS.likeHover};
      }
    }
  }

  &:hover.like-button .number-container {
    color: ${COLORS.like};
  }

  &:hover.comment-button .number-container {
    color: ${COLORS.comment};
  }

  &.comment-active .number-container {
    color: ${COLORS.comment};
  }
`;

const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    transition:
      color 0.2s,
      opacity 0.2s;
    position: relative;
    z-index: 1;
    fill: ${COLORS.primary};
  }

  &.liked-animation svg {
    animation: ${heartPop} 0.3s ease-in-out;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: transparent;
    transform: translate(-50%, -50%);
    transition: all 0.2s ease;
    z-index: 0;
  }

  &.like-icon:hover {
    svg {
      color: ${COLORS.like};
      fill: ${COLORS.like};
    }

    &::before {
      width: 36px;
      height: 36px;
      background: ${COLORS.likeHover};
    }
  }

  &.comment-icon:hover {
    svg {
      color: ${COLORS.comment};
      fill: ${COLORS.comment};
    }

    &::before {
      width: 36px;
      height: 36px;
      background: ${COLORS.commentHover};
    }
  }

  &.comment-active {
    svg {
      color: ${COLORS.comment};
      fill: ${COLORS.comment};
    }

    &::before {
      width: 36px;
      height: 36px;
      background: ${COLORS.commentHover};
    }
  }
`;

const HeartIcon = forwardRef<SVGSVGElement, { filled?: boolean }>(
  ({ filled = false }, ref) => (
    <svg viewBox="0 0 24 24" ref={ref}>
      <g>
        {filled ? (
          <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
        ) : (
          <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
        )}
      </g>
    </svg>
  ),
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24">
    <g>
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
    </g>
  </svg>
);

interface ParticleStyle {
  x: string;
  y: string;
  duration: string;
  delay: string;
  color: string;
  size: string;
  shape: 'circle' | 'heart';
  initialScale: number;
  initialRotation: string;
}

const generateParticleStyle = (): ParticleStyle => {
  const angle = Math.random() * 360;
  const distance = Math.random() * 25 + 25;
  const x = `${Math.cos(angle * (Math.PI / 180)) * distance}px`;
  const y = `${Math.sin(angle * (Math.PI / 180)) * distance - 15}px`;
  const duration = `${Math.random() * 0.4 + 0.5}s`;
  const delay = `${Math.random() * 0.15}s`;
  const colors = [COLORS.like, '#ff78c8', '#ff4da6', '#e60073', '#cc0066'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = Math.random() > 0.3 ? 'circle' : 'heart';
  const rawSize =
    Math.floor(Math.random() * (shape === 'heart' ? 3 : 4)) +
    (shape === 'heart' ? 5 : 4);
  const size = `${rawSize}px`;
  const initialScale = Math.random() * 0.5 + 0.7;
  const initialRotation = `${Math.random() * 90 - 45}deg`;

  return {
    x,
    y,
    duration,
    delay,
    color,
    size,
    shape,
    initialScale,
    initialRotation,
  };
};

const Interaction: React.FC<InteractionProps> = ({
  id,
  issueId,
  reactions,
  comments,
  repoOwner,
  repoName,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, token, login } = useAuth();

  const [heartCount, setHeartCount] = useState(reactions.heartCount);
  const [liked, setLiked] = useState(reactions.userReacted);
  const [commentCount, setCommentCount] = useState(comments.totalCount);
  const [showComments, setShowComments] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; style: ParticleStyle }>
  >([]);

  const toggleLike = async () => {
    const wasLiked = liked;
    const previousCount = heartCount;

    try {
      console.log('Toggle like for issue:', id, liked, token);

      const authenticatedApi = createAuthenticatedApi(token!);

      if (!liked) {
        setLiked(true);
        setHeartCount(previousCount + 1);

        setAnimateLike(true);
        const newParticles = Array.from({
          length: Math.floor(Math.random() * 6) + 10,
        }).map((_, i) => ({
          id: Date.now() + i,
          style: generateParticleStyle(),
        }));
        setParticles(newParticles);

        await addReactionToIssue(authenticatedApi, issueId, 'HEART');
      } else {
        setLiked(false);
        setHeartCount(previousCount - 1);
        await removeReactionFromIssue(authenticatedApi, issueId, 'HEART');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setLiked(wasLiked);
      setHeartCount(previousCount);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (isToggling) {
      return;
    }

    setIsToggling(true);
    toggleLike();
    setIsToggling(false);
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setShowComments(!showComments);
  };

  useEffect(() => {
    setLiked(reactions.userReacted);
    setHeartCount(reactions.heartCount);
  }, [reactions.userReacted, reactions.heartCount]);

  useEffect(() => {
    setCommentCount(comments.totalCount);
  }, [comments.totalCount]);

  useEffect(() => {
    if (animateLike) {
      const timer = setTimeout(() => {
        setAnimateLike(false);
      }, 300);
      const particleTimer = setTimeout(() => {
        setParticles([]);
      }, 1200);
      return () => {
        clearTimeout(timer);
        clearTimeout(particleTimer);
      };
    }
  }, [animateLike]);

  return (
    <Container>
      <ButtonsContainer>
        <InteractionButton
          onClick={handleLike}
          className={`like-button ${liked ? 'liked' : ''}`}
          title={
            isAuthenticated
              ? liked
                ? t('interaction.liked')
                : t('interaction.like')
              : t('interaction.loginToLike')
          }
        >
          <IconContainer
            className={`icon-container like-icon ${animateLike ? 'liked-animation' : ''}`}
          >
            <HeartIcon filled={liked} />
            {particles.map((p) => (
              <Particle
                key={p.id}
                x={p.style.x}
                y={p.style.y}
                duration={p.style.duration}
                delay={p.style.delay}
                color={p.style.color}
                size={p.style.size}
                shape={p.style.shape as 'circle' | 'heart'}
                initialScale={p.style.initialScale}
                initialRotation={p.style.initialRotation}
              />
            ))}
          </IconContainer>
          <NumberContainer
            className="number-container"
            $isVisible={heartCount > 0}
          >
            <NumberFlow
              transformTiming={{ duration: 150, easing: 'ease-in-out' }}
              spinTiming={{ duration: 150, easing: 'ease-in-out' }}
              opacityTiming={{ duration: 150, easing: 'ease-in-out' }}
              value={heartCount}
            />
          </NumberContainer>
        </InteractionButton>
        <InteractionButton
          onClick={handleComment}
          className={`comment-button ${showComments ? 'comment-active' : ''}`}
          title={
            isAuthenticated
              ? t('interaction.comment')
              : t('interaction.loginToComment')
          }
        >
          <IconContainer
            className={`icon-container comment-icon ${showComments ? 'comment-active' : ''}`}
          >
            <CommentIcon />
          </IconContainer>
          <NumberContainer
            className="number-container"
            $isVisible={commentCount > 0}
          >
            <NumberFlow
              transformTiming={{ duration: 150, easing: 'ease-in-out' }}
              spinTiming={{ duration: 150, easing: 'ease-in-out' }}
              opacityTiming={{ duration: 150, easing: 'ease-in-out' }}
              value={commentCount}
            />
          </NumberContainer>
        </InteractionButton>
      </ButtonsContainer>

      <CommentList
        issueNumber={id}
        issueId={issueId}
        isVisible={showComments}
        commentCount={commentCount}
        onCommentCountChange={setCommentCount}
        repoOwner={repoOwner}
        repoName={repoName}
      />
    </Container>
  );
};

export default Interaction;

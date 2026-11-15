import { useRef, useState } from 'react';
import { applyTutorialAction, startTutorialStep } from '@boardgame/game-sdk/tutorial';
import { viewSchema, type Card } from '../shared/index.js';
import { colorMatchTutorial } from './tutorial.js';
import './first-hand.css';

const lessons = [0, 1, 4] as const;
const names = { red: '红', blue: '蓝', yellow: '黄', green: '绿' };

function Face({ card, hint }: { card: Card; hint?: string | undefined }) {
  return <>
    <span className="first-hand-corner">{card.number}<small>{names[card.color]}</small></span>
    <span className="first-hand-number" aria-hidden="true">{card.number}</span>
    <span className="first-hand-corner first-hand-corner--reverse" aria-hidden="true">{card.number}<small>{names[card.color]}</small></span>
    {hint && <span className="first-hand-hint">{hint}</span>}
  </>;
}

/** A local public tutorial scene. No match, account, network or authoritative State. */
export function FirstHandPreview({ backgroundUrl }: { backgroundUrl?: string | null }) {
  const [lesson, setLesson] = useState(0);
  const [progress, setProgress] = useState(() => startTutorialStep(colorMatchTutorial, lessons[0]));
  const [selected, setSelected] = useState<string | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const view = viewSchema.parse(progress.frame.view);
  const selectedCard = view.myHand.find(card => card.id === selected);
  const step = colorMatchTutorial.steps[lessons[lesson]!]!;
  function reset(index: number) {
    setLesson(index);
    setSelected(null);
    setProgress(startTutorialStep(colorMatchTutorial, lessons[index]!));
  }
  function confirm() {
    if (!selected || progress.complete) return;
    const next = applyTutorialAction(colorMatchTutorial, progress, { type: 'play_card', cardId: selected });
    setProgress(next);
    if (next.complete) {
      setSelected(null);
      requestAnimationFrame(() => nextButton.current?.focus({ preventScroll: true }));
    }
  }
  return <section className="first-hand-table" aria-label="Color Match 单人练习" data-practice-complete={progress.complete} data-lesson={lesson}>
    {backgroundUrl && <img className="first-hand-background" src={backgroundUrl} alt="" />}
    <div className="first-hand-table-content">
      <div className="first-hand-header"><strong>Color Match <span>· 单人练习</span></strong><span>{lesson + 1} / {lessons.length} · {step.title}</span></div>
      <div className="first-hand-zones">
        <div className="first-hand-pile"><p>桌上的牌</p><div className={`first-hand-card first-hand-card--${view.topCard.color} first-hand-card--public`} role="img" aria-label={`公共牌 ${names[view.topCard.color]} ${view.topCard.number}`}><Face card={view.topCard} /></div></div>
        <div className="first-hand-mine"><p>{progress.complete && view.phase === 'finished' ? '手牌出完，你赢了！' : '你的手牌'}</p><div className="first-hand-cards">
          {view.myHand.map(card => <button key={card.id} type="button" className={`first-hand-card first-hand-card--${card.color}`} aria-label={`选择 ${names[card.color]} ${card.number}`} aria-pressed={selected === card.id} disabled={progress.complete} onClick={() => setSelected(value => value === card.id ? null : card.id)}>
            <Face card={card} hint={view.legalCardIds.includes(card.id) ? selected === card.id ? '已选中' : '可以接上' : undefined} />
          </button>)}
        </div></div>
      </div>
      <p className="first-hand-feedback" role="status" aria-live="polite">{progress.feedback || '试着选一张能接上的牌。'}</p>
      <div className="first-hand-actions">
        {!progress.complete ? <button type="button" disabled={!selectedCard} onClick={confirm}>{selectedCard ? `打出${names[selectedCard.color]} ${selectedCard.number} →` : '选一张牌'}</button> : <>
          {lesson < lessons.length - 1 && <button type="button" ref={nextButton} onClick={() => reset(lesson + 1)}>再接一手 →</button>}
          <button type="button" className="secondary" ref={lesson === lessons.length - 1 ? nextButton : undefined} onClick={() => reset(0)}>重新练习</button>
        </>}
      </div>
      <div className="first-hand-bottom"><span>匹配颜色或数字，就能出牌</span><span>免登录 · 不计入战绩</span></div>
    </div>
  </section>;
}

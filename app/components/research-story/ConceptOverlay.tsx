"use client";

import {
  INTEREST_PROMPT,
  OPEN_QUESTION_ID,
  counterexamples,
  directionById,
  evidence as fixtureEvidence,
  limitations,
  openQuestions,
  paperById,
  videoIdentityWorld,
} from "../../demo/fixtures/video-identity";
import { stateAt } from "../../demo/evaluate";
import { demoTimeline } from "../../demo/timeline";
import type { Paper } from "../../demo/domain";
import { paperCardLabel } from "../../graph-svg/story";
import type { ConceptFacts, StoryChapter } from "../../graph-svg/types";
import { LABEL_MIN_PX, QUESTION_MIN_PX } from "../../graph-svg/types";

const question = openQuestions[0]!;
const ceById = new Map(counterexamples.map((item) => [item.id, item]));

/** Teaching conditions are projected from source excerpts, never a second fact table. */
export function paperConditionCells(paper: Paper, fullTextRead: boolean) {
  const conditions = fullTextRead && paper.availability === "full-text"
    ? [...new Set(paper.excerpts.flatMap((excerpt) => excerpt.conditions))]
    : [];
  const dimensions = [/遮挡|可见/, /切镜|镜头|机位/, /片段|序列|时长/, /预算|更新/];
  const cells = dimensions.map((pattern) => conditions.filter((condition) => pattern.test(condition)));
  return {
    cells,
    comparison: !fullTextRead || paper.availability !== "full-text"
      ? "全文条件未核查，不能用于条件或预算比较。"
      : cells.some((cell) => cell.length === 0)
        ? "条件记录不完整；未注明不等于相同，不能直接外推或作同预算比较。"
        : "条件已列明；仍须逐项对齐，不能据此认定预算相同或结论可外推。",
  };
}

export function ConceptOverlay({ facts, chapter }: { facts: ConceptFacts; chapter: StoryChapter; active: number }) {
  const evidence = fixtureEvidence.filter((item) => facts.evidenceIds.includes(item.id));
  const limits = limitations.filter((item) => facts.limitationIds.includes(item.id));
  const showQuestion = Boolean(facts.openQuestionId === OPEN_QUESTION_ID);
  const coverage = facts.coverage;
  const reading = stateAt(videoIdentityWorld, demoTimeline, facts.kernelT).paperReading;

  const coverageCard = coverage ? (
    <article className="rw-coverage" data-rw-coverage={coverage.recordId} data-rw-revises={coverage.revises ? "true" : "false"}>
      <p className="rw-label-strong">当前证据覆盖</p>
      {coverage.revises && coverage.previousStatement ? (
        <>
          <p className="rw-prev" data-rw-coverage-prev="">修订前：{coverage.previousStatement}</p>
          {coverage.counterexampleIds.map((id) => {
            const item = ceById.get(id);
            return item ? <p key={id} data-rw-counterexample={id}>{item.paperId} 反例：{item.reason}</p> : null;
          })}
          <p className="rw-revised" data-rw-coverage-next="">修订后：{coverage.revisedStatement}</p>
        </>
      ) : (
        <p data-rw-coverage-current="">{coverage.statement}</p>
      )}
    </article>
  ) : null;


  return (
    <div className="rw-overlay" data-rw-overlay="" style={{ ["--rw-label" as string]: `${LABEL_MIN_PX}px`, ["--rw-question" as string]: `${QUESTION_MIN_PX}px` }}>
      {showQuestion ? (
        <article className="rw-question" data-rw-question={OPEN_QUESTION_ID}>
          <p className="rw-label-strong">开放式问题 · 合成教学数据</p>
          <p className="rw-question-body">{question.question}</p>
          <p><strong>范围：</strong>{question.scope}</p>
          <p><strong>为什么值得查：</strong>{question.whyInvestigate}</p>
          <p><strong>已有依据：</strong>P01/P02 的有条件支持（{question.evidenceIds.join("、")}）。</p>
          <p><strong>已见反例：</strong>P05/P03，避免把长视频或复杂场景本身当作全新问题（{question.counterexampleIds.join("、")}）。</p>
          <p><strong>仍然未知：</strong>{question.uncertainty}</p>
          <p><strong>下一步：</strong>{question.nextAction}</p>
          <p data-rw-status=""><strong>状态：</strong>{facts.statusLabel}</p>
        </article>
      ) : null}

      {coverage?.revises ? coverageCard : null}
      <ol className="rw-legend" aria-label="图例">
        <li><i className="rw-key-path" />已走路径</li>
        <li><i className="rw-key-cover" />当前证据覆盖</li>
        <li><i className="rw-key-dash" />待验证路径</li>
        <li><i className="rw-key-revise" />反例修订</li>
        <li><i className="rw-key-question" />当前问题</li>
      </ol>

      {chapter.id === "interest" ? (
        <p className="rw-chip" data-rw-interest="">教学提示：{INTEREST_PROMPT}</p>
      ) : null}

      {facts.directionIds.length > 0 ? (
        <ul className="rw-dir-list">
          {facts.directionIds.map((id) => (
            <li key={id} className={facts.focusIds.includes(id) ? "is-focus" : ""} data-rw-direction={id}>
              {directionById.get(id)?.name ?? id}
            </li>
          ))}
          {facts.dimmedDirectionIds.map((id) => (
            <li key={id} className="is-dimmed" data-rw-direction={id}>
              {directionById.get(id)?.name ?? id}（未选，保留）
            </li>
          ))}
        </ul>
      ) : null}

      {facts.relations.length > 0 ? (
        <ul className="rw-rel-list" aria-label="关系含义">
          {facts.relations.map((relation) => (
            <li key={`${relation.from}-${relation.to}-${relation.label}`} data-rw-relation={relation.kind}>
              {relation.label}
            </li>
          ))}
        </ul>
      ) : null}

      {facts.paperIds.length > 0 ? (
        <ul className="rw-paper-list">
          {facts.paperIds.map((id) => {
            const paper = paperById.get(id);
            return (
              <li key={id} className="rw-paper-card" data-rw-paper={id}>
                <p className="rw-paper-tag">{paper?.demoTag ?? "演示文献"}</p>
                <p className="rw-paper-title">{paperCardLabel(id)}</p>
              </li>
            );
          })}
        </ul>
      ) : null}

      {evidence.map((item) => (
        <article key={item.id} className="rw-evidence" data-rw-evidence={item.id}>
          <p className="rw-label-strong">{item.id}</p>
          <p>{item.claim}</p>
        </article>
      ))}

      {limits.length > 0 ? (
        <table className="rw-conditions" data-rw-conditions="">
          <caption>已读演示文献的条件与预算比较（未注明不等于相同）</caption>
          <thead>
            <tr>{["来源 / 阅读层级", "遮挡 / 可见性", "切镜 / 机位", "时长", "更新 / 预算", "可比性"].map((label) => <th key={label} scope="col">{label}</th>)}</tr>
          </thead>
          <tbody>
            {facts.paperIds.map((id) => {
              const paper = paperById.get(id);
              if (!paper) return null;
              const fullTextRead = Boolean(reading[id]?.fullTextRead);
              const row = paperConditionCells(paper, fullTextRead);
              return (
                <tr key={id} data-rw-condition-paper={id}>
                  <th scope="row">{id} · {fullTextRead ? "已读全文条件" : "全文未核查"}</th>
                  {row.cells.map((cell, index) => <td key={index}>{cell.length ? cell.join("；") : "未注明 / 待核对"}</td>)}
                  <td>{row.comparison}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {limits.map((item) => <tr key={item.id}><th scope="row">{item.id}</th><td colSpan={5}>{item.statement}</td></tr>)}
          </tfoot>
        </table>
      ) : null}

      {!coverage?.revises ? coverageCard : null}

      {chapter.id === "next-step" ? (
        <article className="rw-next-step" data-rw-next-step="">
          <p className="rw-label-strong">研究者选择下一步</p>
          <p>同预算下比较固定间隔更新与按不确定性触发的更新；按遮挡/切镜分组，记录漂移与恢复失败。实验未做，效果未证实。未验证路径保持虚线，不会自动扩大实线覆盖。</p>
        </article>
      ) : null}
    </div>
  );
}

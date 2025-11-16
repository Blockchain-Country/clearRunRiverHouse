import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { GUEST_INFO } from './GuestInfoObj.jsx'
import './GuestInfo.css'

const GuestInfo = () => {
    const [open_section_id, set_open_section_id] = useState('safety')
    const [open_group_id, set_open_group_id] = useState('rules_regulations')
    const [open_rule_id, set_open_rule_id] = useState('house_rules')

    const handle_toggle_section = (id) => {
        set_open_section_id((prev) => (prev === id ? '' : id))
    }

    const handle_toggle_group = (id) => {
        set_open_group_id((prev) => (prev === id ? '' : id))
    }

    const handle_toggle_rule = (id) => {
        set_open_rule_id((prev) => (prev === id ? '' : id))
    }

    return (
        // id делаю guest-info, чтобы совпадало с якорем в меню
        <section id="guest-info" className="section guest-info">
            <div className="section_inner">
                <div className="section_header">
                    <h2 className="section_title">Guest information</h2>
                    <p className="section_lead">
                        All important details for your stay: before Arrival,
                        Check-In, Safety rules and Check-Out.
                    </p>
                    <div className="section_divider" />
                </div>

                <div className="guest_info_accordion">
                    {GUEST_INFO.map((block) => {
                        const is_open = open_section_id === block.id

                        return (
                            <div key={block.id} className="gi_section">
                                <button
                                    type="button"
                                    className="gi_section_header"
                                    onClick={() =>
                                        handle_toggle_section(block.id)
                                    }
                                    aria-expanded={is_open}
                                >
                                    <div className="gi_section_header_text">
                                        <span className="gi_section_title">
                                            {block.title}
                                        </span>
                                        <span className="gi_section_intro">
                                            {block.intro}
                                        </span>
                                    </div>
                                    <span className="gi_section_icon">
                                        {is_open ? '−' : '+'}
                                    </span>
                                </button>

                                {is_open && (
                                    <div className="gi_section_body">
                                        {block.items &&
                                            block.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="gi_subitem"
                                                >
                                                    <div className="gi_subitem_title">
                                                        {item.title}
                                                    </div>
                                                    <div className="gi_subitem_body">
                                                        <ReactMarkdown>
                                                            {item.body}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}

                                        {block.groups && (
                                            <div className="gi_groups">
                                                {block.groups.map((group) => {
                                                    const group_open =
                                                        open_group_id ===
                                                        group.id
                                                    return (
                                                        <div
                                                            key={group.id}
                                                            className="gi_group"
                                                        >
                                                            <button
                                                                type="button"
                                                                className="gi_group_header"
                                                                onClick={() =>
                                                                    handle_toggle_group(
                                                                        group.id
                                                                    )
                                                                }
                                                                aria-expanded={
                                                                    group_open
                                                                }
                                                            >
                                                                <span className="gi_group_title">
                                                                    {
                                                                        group.title
                                                                    }
                                                                </span>
                                                                <span className="gi_group_icon">
                                                                    {group_open
                                                                        ? '−'
                                                                        : '+'}
                                                                </span>
                                                            </button>

                                                            {group_open && (
                                                                <div className="gi_group_body">
                                                                    {group.sections ? (
                                                                        group.sections.map(
                                                                            (
                                                                                section
                                                                            ) => {
                                                                                const rule_open =
                                                                                    open_rule_id ===
                                                                                    section.id
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            section.id
                                                                                        }
                                                                                        className="gi_rule"
                                                                                    >
                                                                                        <button
                                                                                            type="button"
                                                                                            className="gi_rule_header"
                                                                                            onClick={() =>
                                                                                                handle_toggle_rule(
                                                                                                    section.id
                                                                                                )
                                                                                            }
                                                                                            aria-expanded={
                                                                                                rule_open
                                                                                            }
                                                                                        >
                                                                                            <span className="gi_rule_title">
                                                                                                {
                                                                                                    section.title
                                                                                                }
                                                                                            </span>
                                                                                            <span className="gi_rule_icon">
                                                                                                {rule_open
                                                                                                    ? '−'
                                                                                                    : '+'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {rule_open && (
                                                                                            <div className="gi_rule_body">
                                                                                                <ReactMarkdown>
                                                                                                    {
                                                                                                        section.body
                                                                                                    }
                                                                                                </ReactMarkdown>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        )
                                                                    ) : (
                                                                        // простой текст без вложенных секций
                                                                        <div className="gi_group_text">
                                                                            <ReactMarkdown>
                                                                                {
                                                                                    group.body
                                                                                }
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Внизу — аккуратная ссылка на TouchStay, как в прошлой версии */}
                <div className="guest_info_guide">
                    <p className="guest_info_guide_text">
                        For full step-by-step instructions, photos and videos,
                        open our digital guidebook.
                    </p>
                    <a
                        href="https://guide.touchstay.com/guest/bIw4qHNd5G5o9/info/780424"
                        target="_blank"
                        rel="noreferrer"
                        className="guest_info_guide_link"
                    >
                        Open TouchStay guide
                    </a>
                </div>
            </div>
        </section>
    )
}

export default GuestInfo

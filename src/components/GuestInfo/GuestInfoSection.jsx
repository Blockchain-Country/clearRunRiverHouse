import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { GUEST_INFO } from './guestInfo.data'
import WeatherWidget from '../Weather/WeatherWidget'
import './GuestInfoSection.css'

const GuestInfoSection = () => {
    const [open_section_id, set_open_section_id] = useState('safety')
    const [open_group_id, set_open_group_id] = useState('rules_regulations')
    const [open_rule_id, set_open_rule_id] = useState('house_rules')
    const sectionRefs = useRef({})
    const groupRefs = useRef({})
    const ruleRefs = useRef({})

    const handle_toggle_section = (id) => {
        const wasOpen = open_section_id === id
        set_open_section_id((prev) => (prev === id ? '' : id))
        
        // Smooth scroll to section when opening
        if (!wasOpen && sectionRefs.current[id]) {
            setTimeout(() => {
                sectionRefs.current[id]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                })
            }, 50)
        }
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
            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">Guest information</h2>
                    <p className="section-subtitle">
                        All important details for your stay: before Arrival,
                        Check-In, Safety rules and Check-Out.
                    </p>
                </div>

                <div className="guest_info_accordion">
                    {GUEST_INFO.map((block) => {
                        const is_open = open_section_id === block.id

                        return (
                            <div 
                                key={block.id} 
                                className={`gi_section ${is_open ? 'open' : ''}`}
                                ref={(el) => (sectionRefs.current[block.id] = el)}
                            >
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
                                    <span className={`gi_section_icon ${is_open ? 'open' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                <div 
                                    className={`gi_section_body ${is_open ? 'open' : ''}`}
                                >
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
                                            {/* uncommente this line to bring up local_weather_group */}
                                            {/* {block.groups.map((group) => { */} 
                                            {block.groups
                                                .filter((group) => group.id !== 'local_weather_group') // Temporarily hide local_weather_group
                                                .map((group) => {
                                                // when need to bring up local_weather_group, just remove previous 3 lines
                                                const group_open =
                                                    open_group_id ===
                                                    group.id
                                                return (
                                                    <div
                                                        key={group.id}
                                                        className={`gi_group ${group_open ? 'open' : ''}`}
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
                                                            <span className={`gi_group_icon ${group_open ? 'open' : ''}`}>
                                                                ▼
                                                            </span>
                                                        </button>

                                                        <div className={`gi_group_body ${group_open ? 'open' : ''}`}>
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
                                                                                    className={`gi_rule ${rule_open ? 'open' : ''}`}
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
                                                                                        <span className={`gi_rule_icon ${rule_open ? 'open' : ''}`}>
                                                                                            ▼
                                                                                        </span>
                                                                                    </button>

                                                                                    <div className={`gi_rule_body ${rule_open ? 'open' : ''}`}>
                                                                                                <ReactMarkdown>
                                                                                                    {
                                                                                                        section.body
                                                                                                    }
                                                                                                </ReactMarkdown>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    )
                                                                ) : (
                                                                    // простой текст без вложенных секций
                                                                    <div className="gi_group_text">
                                                                        {group.id === 'local_weather_group' ? (
                                                                            <WeatherWidget />
                                                                        ) : (
                                                                            <ReactMarkdown>
                                                                                {
                                                                                    group.body
                                                                                }
                                                                            </ReactMarkdown>
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default GuestInfoSection


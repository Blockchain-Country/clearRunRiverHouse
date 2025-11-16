import React, { useState } from 'react'
import './Guest_info.css'

const GUEST_INFO = [
  {
    id: 'before',
    title: 'Before you leave home',
    intro: 'What to prepare before your trip to Clear Run Riverhouse.',
    items: [
      {
        id: 'packing',
        title: 'Packing checklist',
        body: 'Here you will put your real packing checklist: swimsuits for hot tub and sauna, warm clothes, etc.',
      },
      {
        id: 'contacts',
        title: 'Booking and contacts',
        body: 'Here you will put how to find booking details, host contact info, and emergency contacts.',
      },
    ],
  },
  {
    id: 'arrival',
    title: 'Arrival information',
    intro: 'Check-in, access codes and first steps when you arrive.',
    items: [
      {
        id: 'check_in',
        title: 'Check-in and access',
        body: 'Insert your real check-in window, smart lock instructions and access code rules here.',
      },
      {
        id: 'parking',
        title: 'Parking and driveway',
        body: 'Where to park, how many cars fit comfortably and what to avoid.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety info and house rules',
    intro: 'Rules, quiet times, septic system and troubleshooting.',
    groups: [
      {
        id: 'rules_regulations',
        title: 'Rules and regulations',
        sections: [
          {
            id: 'house_rules',
            title: 'House rules',
            body: 'Transfer your TouchStay House Rules here in adapted form.',
          },
          {
            id: 'important',
            title: 'Important',
            body: 'Anything critical guests must know about the property, neighbors and HOA.',
          },
          {
            id: 'septic',
            title: 'Sensitive septic system',
            body: 'Explain what cannot be flushed, how to use toilets and what to do in case of issues.',
          },
          {
            id: 'smoking',
            title: 'Smoking policy',
            body: 'Where smoking is not allowed, if there are any designated areas and possible penalties.',
          },
          {
            id: 'quiet_times',
            title: 'Quiet times',
            body: 'Specify quiet hours and expectations to keep good relations with neighbors.',
          },
        ],
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        sections: [
          {
            id: 'wifi',
            title: 'Wi-fi and internet',
            body: 'What to do if wi-fi is slow or not working, how to restart router, etc.',
          },
          {
            id: 'hot_tub_sauna',
            title: 'Hot tub and sauna',
            body: 'Basic troubleshooting steps and what guests must NOT do to avoid damage.',
          },
          {
            id: 'electricity',
            title: 'Electricity and breakers',
            body: 'Where the breaker panel is and what to check if power goes out in one room.',
          },
        ],
      },
    ],
  },
]

const Guest_info = () => {
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
    <section id="guest_info" className="section">
      <div className="section_inner">
        <div className="section_header">
          <h2 className="section_title">Guest information</h2>
          <p className="section_lead">
            All important details for your stay: before you leave home, arrival, safety,
            rules and troubleshooting.
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
                  onClick={() => handle_toggle_section(block.id)}
                >
                  <div className="gi_section_header_text">
                    <span className="gi_section_title">{block.title}</span>
                    <span className="gi_section_intro">{block.intro}</span>
                  </div>
                  <span className="gi_section_icon">{is_open ? '−' : '+'}</span>
                </button>

                {is_open && (
                  <div className="gi_section_body">
                    {block.items &&
                      block.items.map((item) => (
                        <div key={item.id} className="gi_subitem">
                          <div className="gi_subitem_title">{item.title}</div>
                          <div className="gi_subitem_body">{item.body}</div>
                        </div>
                      ))}

                    {block.groups && (
                      <div className="gi_groups">
                        {block.groups.map((group) => {
                          const group_open = open_group_id === group.id
                          return (
                            <div key={group.id} className="gi_group">
                              <button
                                type="button"
                                className="gi_group_header"
                                onClick={() => handle_toggle_group(group.id)}
                              >
                                <span className="gi_group_title">{group.title}</span>
                                <span className="gi_group_icon">
                                  {group_open ? '−' : '+'}
                                </span>
                              </button>

                              {group_open && (
                                <div className="gi_group_body">
                                  {group.sections.map((section) => {
                                    const rule_open = open_rule_id === section.id
                                    return (
                                      <div key={section.id} className="gi_rule">
                                        <button
                                          type="button"
                                          className="gi_rule_header"
                                          onClick={() =>
                                            handle_toggle_rule(section.id)
                                          }
                                        >
                                          <span className="gi_rule_title">
                                            {section.title}
                                          </span>
                                          <span className="gi_rule_icon">
                                            {rule_open ? '−' : '+'}
                                          </span>
                                        </button>
                                        {rule_open && (
                                          <div className="gi_rule_body">
                                            {section.body}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
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
      </div>
    </section>
  )
}

export default Guest_info

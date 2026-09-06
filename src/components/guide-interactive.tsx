'use client'

import { useState } from 'react'

interface Step {
  id: string
  title: string
  subtitle: string
  description: string
  checklist: string[]
  tip: string
}

interface FAQ {
  question: string
  answer: string
  category: string
}

export function GuideTabs({ steps }: { steps: Step[] }) {
  const [activeTab, setActiveTab] = useState(steps[0].id)
  const currentStep = steps.find((s) => s.id === activeTab) || steps[0]

  return (
    <div className="border border-stone-200 bg-white rounded-none">
      {/* Mobile-optimized scrollable tab header */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-stone-200 bg-stone-100 divide-x divide-stone-200">
        {steps.map((step, idx) => {
          const isActive = step.id === activeTab
          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`flex-1 min-w-[140px] sm:min-w-0 p-4 text-left transition-colors rounded-none whitespace-nowrap sm:whitespace-normal ${
                isActive
                  ? 'bg-white text-stone-900 border-b-2 border-b-emerald-800'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-800 block mb-1">
                Step 0{idx + 1}
              </span>
              <span className="text-sm sm:text-base font-semibold block leading-tight">{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-800 font-medium block mb-1">
              {currentStep.subtitle}
            </span>
            <h3 className="text-xl font-bold text-stone-900">{currentStep.title}</h3>
          </div>

          <p className="text-stone-800 leading-relaxed">{currentStep.description}</p>

          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-3">
              Action Items:
            </h4>
            <ul className="space-y-2">
              {currentStep.checklist.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-stone-800 space-x-2">
                  <span className="text-emerald-800 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 bg-stone-800 text-stone-100 p-6 rounded-none space-y-2">
          <span className="text-sm uppercase tracking-widest text-emerald-400 font-mono block font-semibold">
            PRO TIP
          </span>
          <p className=" text-stone-00 leading-relaxed">{currentStep.tip}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="border border-stone-200 bg-white divide-y divide-stone-200 rounded-none">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index} className="rounded-none">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full py-4 px-6 flex justify-between items-center text-left hover:bg-stone-50 transition-colors rounded-none"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold block">
                  {faq.category}
                </span>
                <span className=" font-semibold text-stone-900 block">{faq.question}</span>
              </div>
              <span className="text-lg text-stone-500 font-light ml-4">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-stone-800 leading-relaxed bg-stone-50/50">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

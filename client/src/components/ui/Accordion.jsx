import React from "react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is MERN stack?</AccordionTrigger>
          <AccordionContent>
            MERN stack is a collection of technologies (MongoDB, Express, React, Node.js) 
            used for building full-stack web applications.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How does this accordion work?</AccordionTrigger>
          <AccordionContent>
            It uses Radix UI’s headless accordion primitives styled with Tailwind CSS.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Can I use it in my project?</AccordionTrigger>
          <AccordionContent>
            Yes, just import the component and pass in your questions/answers or any collapsible content.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

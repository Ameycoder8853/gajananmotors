
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I become a verified dealer?",
    answer: "To become a verified dealer, you need to sign up for an account, complete our verification process which includes document submission (Aadhar, PAN, Shop License), and subscribe to one of our dealer plans. Once your documents are approved, your account will be marked as verified.",
  },
  {
    question: "What are the benefits of a Pro subscription?",
    answer: "Pro subscribers get more ad credits, allowing them to list more cars. They also receive premium support and can have their listings featured, which increases visibility and leads to faster sales.",
  },
  {
    question: "How do I contact a seller?",
    answer: "On each car listing page, you'll find a 'Contact Dealer' button. This will reveal the dealer's phone number and other contact information, allowing you to get in touch with them directly.",
  },
  {
    question: "Is there a fee for buying a car?",
    answer: "No, there are no hidden fees for buyers. The price you see on the listing is the price set by the dealer. You negotiate and transact directly with the dealer.",
  },
  {
    question: "How does the AI ad moderation work?",
    answer: "Our AI system automatically scans every new ad's title, description, and images for potential policy violations, such as inappropriate content or deceptive information. This helps maintain a high-quality and trustworthy marketplace for everyone.",
  },
];

export function Faq() {
  return (
    <section className="py-16 sm:py-24">
      <div className="px-8">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have questions? We have answers. If you can't find what you're
            looking for, feel free to contact us.
          </p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}


"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission logic here (e.g., Supabase function or email service)
        alert("Thank you for your message! We will get back to you soon.")
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">Get in Touch</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Have questions about buying or selling? Our team is here to help you every step of the way.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold">Contact Information</h3>
                        <p className="text-muted-foreground">
                            Fill up the form and our team will get back to you within 24 hours.
                        </p>

                        <div className="flex items-start space-x-4">
                            <Mail className="w-6 h-6 text-emerald-600 mt-1" />
                            <div>
                                <h4 className="font-semibold">Email</h4>
                                <p className="text-slate-600 dark:text-slate-400">support@landsale.lk</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <Phone className="w-6 h-6 text-emerald-600 mt-1" />
                            <div>
                                <h4 className="font-semibold">Phone</h4>
                                <p className="text-slate-600 dark:text-slate-400">+94 77 123 4567</p>
                                <p className="text-slate-600 dark:text-slate-400">+94 11 234 5678</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                            <div>
                                <h4 className="font-semibold">Office</h4>
                                <p className="text-slate-600 dark:text-slate-400">
                                    No. 123, Galle Road,<br />
                                    Colombo 03,<br />
                                    Sri Lanka
                                </p>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-emerald-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-white">Business Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Monday - Friday</span>
                                <span>9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Saturday</span>
                                <span>9:00 AM - 1:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sunday</span>
                                <span>Closed</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send us a Message</CardTitle>
                        <CardDescription>We'd love to hear from you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" placeholder="Doe" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="john@example.com" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="Inquiry about..." required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us how we can help..."
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                                <Send className="w-4 h-4 mr-2" /> Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

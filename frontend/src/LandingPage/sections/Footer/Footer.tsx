import { Github, Linkedin, Twitter } from "lucide-react";

function Footer() {
    return (
        <footer className="relative py-20 px-4 bg-background-secondary overflow-hidden">
            {/* Background footer image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/images/navin-footer.png')" }}
            />
            
            {/* Ambient glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto">
                {/* CTA Section */}
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
                        Get Started <span className="text-primary">Today</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                        Join 500+ enterprise leaders. Get the latest on blockchain logistics and zero trust supply chain management.
                    </p>
                    
                    {/* Email Subscribe Form */}
                    <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            className="flex-1 px-6 py-4 bg-background-card/60 backdrop-blur-lg border border-border-light rounded-2xl text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-light focus:shadow-glow-blue transition-all duration-300 hover:border-primary-light/50"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-light text-background font-display font-semibold text-lg rounded-2xl transition-all duration-300 hover:shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] border border-primary-light/40"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
                
                {/* Footer Content */}
                <div className="pt-12 border-t border-border-light">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Logo and tagline */}
                        <div className="flex items-center gap-4">
                            <img 
                                src="/images/logo.svg" 
                                alt="Navin Logo" 
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h3 className="font-display text-xl font-bold text-text-primary">Navin</h3>
                                <p className="text-sm text-text-secondary">The New Standard in Logistics Security</p>
                            </div>
                        </div>
                        
                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                        </div>
                    </div>
                    
                    {/* Copyright */}
                    <div className="mt-8 text-center text-sm text-text-secondary">
                        <p>&copy; {new Date().getFullYear()} Navin. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                    <p className="text-sm text-slate-500 italic">
                        Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. Introduzione</h2>
                        <p>
                            Benvenuto su "Le Università" (la "Piattaforma"). Ci impegniamo a proteggere i tuoi dati personali e a rispettare la tua privacy.
                            Questa Privacy Policy spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo i tuoi dati personali in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR) (UE) 2016/679.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. Titolare del Trattamento</h2>
                        <p>
                            Il Titolare del Trattamento dei dati per "Le Università" è:<br />
                            <strong>NBN WEST EOOD</strong><br />
                            35, Dunav str<br />
                            Sofia, Bulgaria<br />
                            VAT: BG207008336<br />
                            Email: info@nbn-west.com
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. Tipologie di Dati Raccolti</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Dati Identificativi:</strong> Nome, indirizzo email, numero di matricola (se applicabile).</li>
                            <li><strong>Dati di Utilizzo:</strong> Informazioni su come utilizzi il nostro sito web, inclusi indirizzo IP, tipo di browser e sistema operativo.</li>
                            <li><strong>Dati di Apprendimento:</strong> Monitoraggio dei progressi, risultati dei quiz e interazioni con il corso.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. Finalità del Trattamento</h2>
                        <p>Trattiamo i tuoi dati per le seguenti finalità:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Fornire e mantenere i nostri servizi educativi.</li>
                            <li>Monitorare i tuoi progressi di apprendimento e adattare il curriculum.</li>
                            <li>Notificarti modifiche al nostro servizio.</li>
                            <li>Fornire assistenza clienti.</li>
                            <li>Raccogliere analisi o informazioni preziose per migliorare il Servizio.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. Conservazione dei Dati</h2>
                        <p>
                            Conserveremo i tuoi Dati Personali solo per il tempo necessario alle finalità indicate in questa Privacy Policy.
                            Conserveremo e utilizzeremo i tuoi Dati Personali nella misura necessaria per adempiere ai nostri obblighi legali, risolvere controversie e far rispettare i nostri accordi e le nostre policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6. I Tuoi Diritti GDPR</h2>
                        <p>Ai sensi del GDPR, hai i seguenti diritti:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Diritto di Accesso:</strong> Hai il diritto di richiedere copie dei tuoi dati personali.</li>
                            <li><strong>Diritto di Rettifica:</strong> Hai il diritto di richiedere la correzione di informazioni che ritieni inaccurate.</li>
                            <li><strong>Diritto alla Cancellazione:</strong> Hai il diritto di richiedere la cancellazione dei tuoi dati personali, a determinate condizioni.</li>
                            <li><strong>Diritto alla Limitazione del Trattamento:</strong> Hai il diritto di richiedere la limitazione del trattamento dei tuoi dati personali.</li>
                            <li><strong>Diritto alla Portabilità dei Dati:</strong> Hai il diritto di richiedere il trasferimento dei dati che abbiamo raccolto a un'altra organizzazione o direttamente a te.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">7. Contattaci</h2>
                        <p>
                            Se hai domande su questa Privacy Policy, ti preghiamo di contattarci via email all'indirizzo info@nbn-west.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

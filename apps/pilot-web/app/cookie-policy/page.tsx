export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                    Cookie Policy
                </h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                    <p className="text-sm text-slate-500 italic">
                        Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. Cosa sono i Cookie</h2>
                        <p>
                            I cookie sono piccoli file di testo che vengono salvati sul tuo computer o dispositivo mobile dai siti web che visiti.
                            Sono ampiamente utilizzati per far funzionare i siti web, o farli funzionare in modo più efficiente, oltre a fornire informazioni ai proprietari del sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. Come Utilizziamo i Cookie</h2>
                        <p>Utilizziamo i cookie per le seguenti finalità:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Cookie Essenziali:</strong> Sono cookie necessari per il funzionamento del nostro sito web. Includono, ad esempio, cookie che ti permettono di accedere ad aree protette del nostro sito.</li>
                            <li><strong>Cookie Analitici/Prestazionali:</strong> Ci permettono di riconoscere e contare il numero di visitatori e di vedere come i visitatori si muovono all'interno del nostro sito web mentre lo utilizzano. Questo ci aiuta a migliorare il funzionamento del nostro sito.</li>
                            <li><strong>Cookie di Funzionalità:</strong> Vengono utilizzati per riconoscerti quando ritorni sul nostro sito web. Questo ci permette di personalizzare i nostri contenuti per te e ricordare le tue preferenze.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. Gestione dei Cookie</h2>
                        <p>
                            Quando visiti il nostro sito web per la prima volta, ti chiediamo il consenso all'utilizzo dei cookie non essenziali tramite il nostro Banner Cookie.
                            Puoi revocare il tuo consenso in qualsiasi momento cancellando i cookie del tuo browser o modificando le impostazioni del browser stesso.
                        </p>
                        <p className="mt-2">
                            La maggior parte dei browser web consente un certo controllo sulla maggior parte dei cookie attraverso le impostazioni del browser. Per saperne di più sui cookie, incluso come vedere quali cookie sono stati impostati, visita www.aboutcookies.org o www.allaboutcookies.org.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. Modifiche a questa Policy</h2>
                        <p>
                            Potremmo aggiornare la nostra Cookie Policy di tanto in tanto. Ti notificheremo eventuali modifiche pubblicando la nuova Cookie Policy su questa pagina.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. Contattaci</h2>
                        <p>
                            Se hai domande sul nostro utilizzo dei cookie, ti preghiamo di contattarci all'indirizzo info@nbn-west.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

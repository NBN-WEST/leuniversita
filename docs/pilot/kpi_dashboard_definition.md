# Dashboard KPI - Definizione

La Dashboard Docente deve rispondere a tre domande fondamentali:
1. **La classe sta studiando?** (Engagement)
2. **Cosa non hanno capito?** (Knowledge Gaps)
3. **Chi è a rischio?** (At-Risk Students)

## Metriche Chiave

### 1. Engagement (Frequenza)
- **Weekly Active Students**: Numero di studenti unici con almeno 1 attività negli ultimi 7 giorni.
- **Diagnostic Completion Rate**: % di studenti che hanno completato il test iniziale.

### 2. Knowledge Gaps (Efficacia)
- **Heatmap per Argomento**:
    - "Diritti Reali": 🟢 75% Mastery Medio
    - "Obbligazioni": 🟡 55% Mastery Medio
    - "Contratti": 🔴 30% Mastery Medio
- **Top 5 Errori Comuni**: Le domande sbagliate più frequenti.

### 3. Progress (Evoluzione)
- **Improvement Delta**: Differenza media tra Mastery T0 e Mastery T1.
- **Plan Adherence**: % di tas attività suggerite completate.

## Implementazione (MVP v0.8.0)
Attualmente la vista `/admin` mostra i contatori grezzi.
Per il Pilot, l'aggiornamento (v0.9.0) includerà la **Heatmap per Argomento** aggregando i dati della tabella `learning_progress`.

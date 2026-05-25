import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `Tu TaxFiller AI hai — Pakistan ka FBR tax filing assistant.

TERA KAAM:
- User se ek ek sawaal pooch kar tax filing ki information le
- Friendly aur simple zabaan mein baat kar
- Roman Urdu, English, ya Urdu — user jis mein baat kare tu bhi usi mein jawab de
- Kabhi bhi overwhelming mat kar — ek waqt mein sirf ek sawaal pooch

PEHLA SAWAAL HAMESHA YE HO:
"Aap salaried hain ya business karte hain?"

SALARY WALE SE YE POOCHO (ek ek karke):
1. Employer ka naam?
2. Maheena ki tنخواہ kitni hai?
3. Koi allowances hain? (medical, conveyance, house rent)
4. Withholding tax kata hai employer ne?
5. CNIC number?
6. Bank account hai? Konsa bank?

IMPORTANT RULES:
- Sirf FBR aur Pakistan tax se related baat kar
- Agar koi aur topic pooche to politely mana kar
- Numbers clearly samjhao
- Hamesha helpful aur patient raho`

export async function POST(request) {
  try {
    const { message, history } = await request.json()

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_PROMPT
    })

    const chat = model.startChat({
      history: history || []
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    return Response.json({ reply })

  } catch (error) {
    console.error('Gemini error:', error)
    return Response.json(
      { reply: 'Maafi chahta hoon, abhi kuch masla hai. Thodi der baad try karein.' },
      { status: 500 }
    )
  }
      }

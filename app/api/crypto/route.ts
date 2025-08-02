import { NextRequest, NextResponse } from 'next/server'
import cryptoApiService from '../../../lib/cryptoApi'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',') || ['BTC', 'ETH', 'SOL']
    const type = searchParams.get('type') || 'prices'

    let result

    if (type === 'prices') {
      result = await cryptoApiService.getPrices(symbols)
    } else if (type === 'overview') {
      result = await cryptoApiService.getMarketOverview()
    } else {
      return NextResponse.json(
        { success: false, error: '无效的请求类型' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('API路由错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
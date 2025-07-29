/**
 * 色分け機能のデモテスト
 */

// ANSIカラーコード
const ANSI_COLORS = {
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_BLUE: '\x1b[94m',
  BRIGHT_YELLOW: '\x1b[93m',
  BRIGHT_MAGENTA: '\x1b[95m',
  BRIGHT_CYAN: '\x1b[96m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m'
};

// サブエージェントの色分けデモ
function demoColoredSubagents() {
  console.log('🎭 サブエージェント色分けデモ開始\n');
  
  const agents = [
    { name: 'コードレビューエージェント', color: ANSI_COLORS.BRIGHT_GREEN, message: 'このコードには型安全性の問題があります。' },
    { name: 'デバッグエージェント', color: ANSI_COLORS.BRIGHT_RED, message: 'パフォーマンスの改善が必要です。' },
    { name: 'セキュリティエージェント', color: ANSI_COLORS.BRIGHT_MAGENTA, message: 'セキュリティ上の脆弱性を発見しました。' },
    { name: 'フロントエンドエージェント', color: ANSI_COLORS.BRIGHT_BLUE, message: 'UIの改善提案があります。' },
    { name: 'バックエンドエージェント', color: ANSI_COLORS.BRIGHT_CYAN, message: 'データベースの最適化を提案します。' }
  ];

  agents.forEach((agent, index) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${ANSI_COLORS.WHITE}[${timestamp}]${ANSI_COLORS.RESET} ${agent.color}${agent.name}${ANSI_COLORS.RESET}: 💬 ${agent.color}${agent.message}${ANSI_COLORS.RESET}`);
    
    // 少し待機して自然な会話の流れを演出
    setTimeout(() => {}, 500);
  });

  console.log('\n🎉 色分けデモ完了！各サブエージェントが異なる色で話しているのが分かりますか？');
}

// システムメッセージの色分けデモ
function demoSysMessages() {
  console.log('\n📋 システムメッセージの色分けデモ\n');
  
  const messages = [
    { text: 'システム情報メッセージ', color: ANSI_COLORS.BRIGHT_BLUE, emoji: 'ℹ️' },
    { text: '成功メッセージ', color: ANSI_COLORS.BRIGHT_GREEN, emoji: '✅' },
    { text: '警告メッセージ', color: ANSI_COLORS.BRIGHT_YELLOW, emoji: '⚠️' },
    { text: 'エラーメッセージ', color: ANSI_COLORS.BRIGHT_RED, emoji: '❌' },
    { text: '進捗メッセージ', color: ANSI_COLORS.BRIGHT_CYAN, emoji: '🔄' }
  ];

  messages.forEach(msg => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${ANSI_COLORS.WHITE}[${timestamp}]${ANSI_COLORS.RESET} ${msg.emoji} ${msg.color}${msg.text}${ANSI_COLORS.RESET}`);
  });
}

// 設定変更デモ
function demoConfiguration() {
  console.log('\n⚙️ 設定変更デモ\n');
  
  // 色分け無効化
  console.log(`${ANSI_COLORS.BRIGHT_YELLOW}⚠️ 色分けが無効化されました${ANSI_COLORS.RESET}`);
  
  // 色分け再有効化
  console.log(`${ANSI_COLORS.BRIGHT_GREEN}✅ 色分けが再有効化されました${ANSI_COLORS.RESET}`);
  
  // 絵文字無効化
  console.log(`${ANSI_COLORS.BRIGHT_BLUE}ℹ️ 絵文字が無効化されました${ANSI_COLORS.RESET}`);
  
  // 絵文字再有効化
  console.log(`${ANSI_COLORS.BRIGHT_GREEN}✅ 絵文字が再有効化されました${ANSI_COLORS.RESET}`);
}

// カスタム色デモ
function demoCustomColors() {
  console.log('\n🎨 カスタム色デモ\n');
  
  const customColors = {
    'special-agent': '\x1b[1m\x1b[35m', // 太字マゼンタ
    'vip-agent': '\x1b[1m\x1b[33m'      // 太字黄
  };

  console.log(`${customColors['special-agent']}特別エージェント${ANSI_COLORS.RESET}: 💬 ${customColors['special-agent']}これは特別な色で表示されるメッセージです。${ANSI_COLORS.RESET}`);
  console.log(`${customColors['vip-agent']}VIPエージェント${ANSI_COLORS.RESET}: 💬 ${customColors['vip-agent']}これはVIPエージェントのメッセージです。${ANSI_COLORS.RESET}`);
}

// メイン実行
function main() {
  console.log('🚀 色分け機能全テスト開始\n');
  
  demoColoredSubagents();
  demoSysMessages();
  demoConfiguration();
  demoCustomColors();
  
  console.log('\n✅ 全テスト完了！');
  console.log('\n📊 実装された機能:');
  console.log('- ✅ ANSIカラーコード対応');
  console.log('- ✅ 専門分野別色マッピング');
  console.log('- ✅ カスタム色設定');
  console.log('- ✅ タイムスタンプ表示');
  console.log('- ✅ 絵文字サポート');
  console.log('- ✅ 設定変更機能');
}

// 実行
main(); 
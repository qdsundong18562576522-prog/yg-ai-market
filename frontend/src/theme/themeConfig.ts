import type { ThemeConfig } from 'antd'

const themeConfig: ThemeConfig = {
  token: {
    /* Primary: Charcoal #111111 (Intercom ink) */
    colorPrimary: '#111111',
    colorPrimaryHover: '#2a2a2a',
    colorPrimaryActive: '#000000',

    /* Backgrounds: Cream canvas + White cards */
    colorBgBase: '#f5f1ec',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f1ec',
    colorBgElevated: '#ffffff',

    /* Text: Intercom ink hierarchy */
    colorTextBase: '#111111',
    colorTextSecondary: '#626260',
    colorTextTertiary: '#7b7b78',
    colorTextQuaternary: '#9c9fa5',

    /* Borders: Hairline warm gray */
    colorBorder: '#d3cec6',
    colorBorderSecondary: '#ebe7e1',

    /* Semantic */
    colorSuccess: '#0bdf50',
    colorWarning: '#ff5600',
    colorError: '#c41c1c',
    colorInfo: '#111111',

    /* Typography */
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeightStrong: 600,

    /* Border Radius */
    borderRadius: 8,
    borderRadiusLG: 12,

    /* Sizes */
    controlHeight: 40,
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 18,
    fontSizeHeading3: 16,

    /* Spacing */
    padding: 16,
    paddingLG: 24,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginXS: 8,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      fontWeight: 500,
      fontSize: 15,
      primaryColor: '#ffffff',
      primaryShadow: 'none',
      defaultBorderColor: '#d3cec6',
      defaultColor: '#111111',
      defaultBg: '#ffffff',
    },
    Card: {
      borderRadius: 12,
      padding: 24,
    },
    Menu: {
      itemBorderRadius: 8,
      itemColor: '#626260',
      itemSelectedColor: '#111111',
      itemSelectedBg: '#ebe7e1',
      itemHoverColor: '#111111',
      itemHoverBg: '#f5f1ec',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      colorBgContainer: '#ffffff',
      colorBorder: '#d3cec6',
      hoverBorderColor: '#111111',
      activeBorderColor: '#111111',
      colorPrimary: '#111111',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      colorBorder: '#d3cec6',
    },
    Tag: {
      borderRadius: 4,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#ebe7e1',
      headerColor: '#111111',
      borderColor: '#ebe7e1',
    },
    Modal: {
      borderRadius: 12,
    },
    Switch: {
      trackHeight: 22,
    },
    Tabs: {
      cardBg: '#ffffff',
    },
    Badge: {
      dotSize: 8,
    },
  },
}

export default themeConfig

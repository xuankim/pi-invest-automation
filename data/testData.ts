/**
 * Dữ liệu dùng chung cho các testcase.
 * Thay đổi tại đây sẽ áp dụng cho toàn bộ test suite.
 */
export const TEST_DATA = {
  /** Tên dự án dùng trong các testcase chiến dịch, booking group, v.v. */
  projectName: 'SkyZen',

  /** Hạng thành viên dùng trong các testcase booking group, ráp căn, v.v. */
  memberTier: 'NEW',

  /** Giá trị chiết khấu nhóm khách hàng (số) */
  memberDiscount: '1',

  /** Thời gian countdown trước khi bắt đầu ráp căn (phút) */
  rapCanCountdown: '2',

  /** Giá sản phẩm mặc định khi chưa nhập giá (VND) */
  defaultProductPrice: '20000000',

  /** % chiết khấu được nhận tại tab Sản phẩm ráp căn */
  productDiscountPercent: '1',
};

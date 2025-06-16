class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    search() {
      const keyword = this.queryString.keyword ? {
        name: {
          $regex: this.queryString.keyword,
          $options: 'i'
        }
      } : {};
  
      this.query = this.query.find({ ...keyword });
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryString };
      
      // Remove fields from query
      const removeFields = ['keyword', 'limit', 'page'];
      removeFields.forEach(el => delete queryCopy[el]);
  
      // Filter for category
      if (queryCopy.category) {
        queryCopy.category = {
          $regex: queryCopy.category,
          $options: 'i'
        };
      }
  
      // Filter for price range
      if (queryCopy.price) {
        const [gte, lte] = queryCopy.price.split('-');
        queryCopy.price = {
          $gte: Number(gte),
          $lte: Number(lte)
        };
      }
  
      this.query = this.query.find(queryCopy);
      return this;
    }
  
    pagination(resPerPage) {
      const currentPage = Number(this.queryString.page) || 1;
      const skip = resPerPage * (currentPage - 1);
  
      this.query = this.query.limit(resPerPage).skip(skip);
      return this;
    }
  }
  
  export default APIFeatures;
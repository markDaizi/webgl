
'use strict'

function main(){
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if(!gl){
    return
  }

  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])

  var positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

  var resolutionUniformLocation = gl.getUnifirmLocation(program, 'u_resolution')

  var positionBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  var positions =[
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW)

  webglUtils.resizeCanvasToDisplaySize(gl.canvas)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.clearColor(0,0,0,0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program)

  gl.enableVertexAttribArray(positionAttributeLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  var size = 2       
  var type = gl.FLOAT  
  var normalize = false 
  var stride = 0        
  var offset = 0
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset)

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)


  var primitiveType = gl.TRIANGLES
  var offset = 0
  var count = 6
  gl.drawArrays(primitiveType, offset, count)
}

main()

function search (nums, targrt){
  if(nums.length < 0) {
    return -1
  }
  let len = nums.length - 1
  let left = 0
  let right = len
  while(left<=right){
    let mid = Math.floor(left + (right - left)/2)
    if(nums[mid] === targrt){
      return mid
    }else if(nums[mid]> targrt){
      right = mid-1
    }else{
      left = mid+1
    }
  } 
  return -1
}

function searchInsert(nums, target){
  let len = nums.length - 1
  if(len === 0) {
    return 0
  }
  if(nums[len]<target){
    return len+1
  }
  let left = 0
  let right = len
  while(left < right){
    let mid = left + ((right-left)>>1)
    if(nums[mid]<target){
      left = mid +1
    }else{
      right = mid
    }
  }
  return left
}

var mySqrt = function(x) {
  if(x < 2) {
    return x 
  }
  let left = 0
  let right = x
  while(left < right){
    let mid = left + ((right - left)>>1)
    if(mid*mid>x){
      right = mid - 1
    }else{
      left = mid
    }
  }
  return left
  
};

function binarySearch(nums,target,lower){
  let left = 0
  let right = nums.length - 1
  let ans = nums.length
  while(left <= right){
    let mid = left + ((right-left)>>1)
    if(nums[mid] > target || (lower&& nums[mid]>=target)){
      right = mid -1
      ans = mid
    }else{
      left = mid + 1
    }
  }
  return ans
}
var searchRange = function(nums, target) {
  let ans = [-1,-1]
  let leftIdx = binarySearch(nums, target, true)
  let rightIdx = binarySearch(nums, target, false) - 1
  if (leftIdx <= rightIdx && rightIdx < nums.length && nums[leftIdx] === target && nums[rightIdx] === target) {
    ans = [leftIdx, rightIdx];
  } 
  return ans;
};

var lengthOfLIS = function(nums) {
  let len = nums.length
  let res = 1
  if(len<2) return len
  let dp = new Array(len).fill(1)
  for(let i=1; i<len; i++){
    for(let j=0; j<i; j++){
      dp[i] = Math.max(dp[i],dp[j]+1)
    }
  }
  Math.max.apply(null,dp)
};